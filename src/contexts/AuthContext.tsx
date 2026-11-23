import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { StorageService } from '@/services/storageService';
import { auth, isFirebaseConfigured } from '@/firebase/config';
import { signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (uid: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  firstTimeSetup: (data: { fullName: string; email: string; employeeId: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'giits_active_user_uid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize active user
  useEffect(() => {
    async function initAuth() {
      try {
        if (isFirebaseConfigured && auth) {
          // Listen to Firebase Auth state
          onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
              const user = await StorageService.getUser(fbUser.uid);
              if (user && user.isActive) {
                setCurrentUser(user);
              } else {
                setCurrentUser(null);
              }
            } else {
              // Check local storage for fallback user
              const savedUid = localStorage.getItem(AUTH_USER_KEY) || 'user_principal';
              const user = await StorageService.getUser(savedUid);
              setCurrentUser(user && user.isActive ? user : null);
            }
            setIsLoading(false);
          });
        } else {
          // Local persistent demo mode
          const savedUid = localStorage.getItem(AUTH_USER_KEY) || 'user_principal';
          const user = await StorageService.getUser(savedUid);
          setCurrentUser(user && user.isActive ? user : null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth && password) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = await StorageService.getUser(userCredential.user.uid);
          if (!user) {
            setIsLoading(false);
            return { success: false, error: 'User record not found in faculty database.' };
          }
          if (!user.isActive) {
            await fbSignOut(auth);
            setIsLoading(false);
            return { success: false, error: 'Account is deactivated. Contact the Administrator.' };
          }
          setCurrentUser(user);
          localStorage.setItem(AUTH_USER_KEY, user.uid);
          setIsLoading(false);
          return { success: true };
        } catch (firebaseErr: any) {
          console.warn('Firebase login failed, falling back to local verification:', firebaseErr.message);
        }
      }

      // Check users database
      const users = await StorageService.getUsers();
      const matched = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      
      if (!matched) {
        setIsLoading(false);
        return { success: false, error: 'No account registered with this email address.' };
      }

      if (!matched.isActive) {
        setIsLoading(false);
        return { success: false, error: 'Account has been deactivated. Please contact your HOD or Principal.' };
      }

      setCurrentUser(matched);
      localStorage.setItem(AUTH_USER_KEY, matched.uid);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed. Please verify your credentials.' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await fbSignOut(auth);
      }
      localStorage.removeItem(AUTH_USER_KEY);
      // Clear sensitive local data on logout (Section 21)
      sessionStorage.clear();
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchUser = async (uid: string) => {
    setIsLoading(true);
    const user = await StorageService.getUser(uid);
    if (user && user.isActive) {
      setCurrentUser(user);
      localStorage.setItem(AUTH_USER_KEY, user.uid);
    }
    setIsLoading(false);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    // Disallow role or department manipulation by faculty (Section 4 & 18)
    const sanitized = { ...data };
    if (currentUser.role === 'faculty') {
      delete sanitized.role;
      delete sanitized.departmentId;
      delete sanitized.isActive;
    }
    const updated = { ...currentUser, ...sanitized, updatedAt: new Date().toISOString() };
    await StorageService.saveUser(updated, currentUser.uid);
    setCurrentUser(updated);
  };

  const firstTimeSetup = async (data: { fullName: string; email: string; employeeId: string }) => {
    const principalUser: User = {
      uid: 'user_principal_init',
      employeeId: data.employeeId,
      fullName: data.fullName,
      email: data.email,
      role: 'principal',
      departmentId: '',
      departmentName: 'Administration',
      designation: 'Professor',
      qualification: 'M.Tech, Ph.D.',
      mobileNumber: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      employmentStatus: 'Regular',
      assignedSubjects: [],
      assignedClasses: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await StorageService.saveUser(principalUser, 'system_init');
    setCurrentUser(principalUser);
    localStorage.setItem(AUTH_USER_KEY, principalUser.uid);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        login,
        logout,
        switchUser,
        updateProfile,
        firstTimeSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
