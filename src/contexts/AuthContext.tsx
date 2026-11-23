import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { StorageService } from '@/services/storageService';
import { auth, isFirebaseConfigured } from '@/firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'giits_active_user_uid';

function createDefaultPrincipal(uid: string): User {
  return {
    uid,
    employeeId: 'GIITS-DIR-001',
    fullName: 'Dr. Pradeep',
    email: 'pradeep4045t7@gmail.com',
    role: 'principal',
    departmentId: '',
    departmentName: 'GIITS Administration',
    designation: 'Professor',
    qualification: 'M.Tech, Ph.D.',
    mobileNumber: '',
    dateOfJoining: '2026-01-01',
    employmentStatus: 'Regular',
    assignedSubjects: [],
    assignedClasses: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize active user session
  useEffect(() => {
    async function initAuth() {
      try {
        if (isFirebaseConfigured && auth) {
          onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
              let user = await StorageService.getUser(fbUser.uid);
              if (!user && fbUser.email?.toLowerCase() === 'pradeep4045t7@gmail.com') {
                const defaultPrin = createDefaultPrincipal(fbUser.uid);
                await StorageService.saveUser(defaultPrin, fbUser.uid);
                user = defaultPrin;
              }
              if (user && user.isActive) {
                setCurrentUser(user);
              } else {
                setCurrentUser(null);
              }
            } else {
              const savedUid = localStorage.getItem(AUTH_USER_KEY);
              if (savedUid) {
                const user = await StorageService.getUser(savedUid);
                setCurrentUser(user && user.isActive ? user : null);
              } else {
                setCurrentUser(null);
              }
            }
            setIsLoading(false);
          });
        } else {
          const savedUid = localStorage.getItem(AUTH_USER_KEY);
          if (savedUid) {
            const user = await StorageService.getUser(savedUid);
            setCurrentUser(user && user.isActive ? user : null);
          } else {
            setCurrentUser(null);
          }
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
    const cleanEmail = email.trim().toLowerCase();
    const isPrincipal = cleanEmail === 'pradeep4045t7@gmail.com';
    const isPrincipalCorrectPass = password === 'Pradeep@2005';

    try {
      // 1. Firebase Authentication attempt
      if (isFirebaseConfigured && auth && password) {
        let fbAuthSuccess = false;
        let fbUid = '';

        try {
          const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
          fbUid = userCredential.user.uid;
          fbAuthSuccess = true;
        } catch (signInErr: any) {
          // If this is the designated Principal and they don't exist in Firebase Auth yet, auto-register them
          if (
            isPrincipal &&
            isPrincipalCorrectPass &&
            (signInErr.code === 'auth/user-not-found' ||
             signInErr.code === 'auth/invalid-credential' ||
             signInErr.code === 'auth/invalid-login-credentials')
          ) {
            try {
              const createdCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
              fbUid = createdCred.user.uid;
              fbAuthSuccess = true;
            } catch (createErr) {
              console.warn('Could not auto-create Principal in Firebase Auth:', createErr);
            }
          }
        }

        if (fbAuthSuccess && fbUid) {
          let user = await StorageService.getUser(fbUid);
          if (!user && isPrincipal) {
            const defaultPrin = createDefaultPrincipal(fbUid);
            await StorageService.saveUser(defaultPrin, fbUid);
            user = defaultPrin;
          }

          if (user) {
            if (!user.isActive) {
              await fbSignOut(auth);
              setIsLoading(false);
              return { success: false, error: 'Account is deactivated. Contact Institutional Administration.' };
            }
            setCurrentUser(user);
            localStorage.setItem(AUTH_USER_KEY, user.uid);
            setIsLoading(false);
            return { success: true };
          }
        }
      }

      // 2. Direct Principal credentials validation
      if (isPrincipal) {
        if (!isPrincipalCorrectPass) {
          setIsLoading(false);
          return { success: false, error: 'Invalid password for Principal credentials.' };
        }

        const usersList = await StorageService.getUsers();
        let principalUser = usersList.find(
          (u) => u.email.toLowerCase() === 'pradeep4045t7@gmail.com'
        );

        if (!principalUser) {
          const defaultPrin = createDefaultPrincipal('user_principal_pradeep');
          await StorageService.saveUser(defaultPrin, 'user_principal_pradeep');
          principalUser = defaultPrin;
        }

        setCurrentUser(principalUser);
        localStorage.setItem(AUTH_USER_KEY, principalUser.uid);
        setIsLoading(false);
        return { success: true };
      }

      // 3. Faculty / HOD registered accounts validation
      const users = await StorageService.getUsers();
      const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!matched) {
        setIsLoading(false);
        return { success: false, error: 'No account registered with this email address.' };
      }
      if (!matched.isActive) {
        setIsLoading(false);
        return { success: false, error: 'Account is deactivated. Please contact the Principal.' };
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
      sessionStorage.clear();
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
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

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        login,
        logout,
        updateProfile,
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
