const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Privileged Faculty Account Creation using Firebase Admin SDK
 * Password is never exposed to HODs or stored in Firestore (Section 6)
 */
exports.createFacultyAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await admin.firestore().collection('users').doc(callerUid).get();
  const caller = callerSnap.data();

  if (!caller || (caller.role !== 'principal' && caller.role !== 'hod')) {
    throw new functions.https.HttpsError('permission-denied', 'Unauthorized to create faculty accounts.');
  }

  const { email, fullName, employeeId, departmentId, designation, qualification } = data;

  // Prevent HOD from creating accounts in other departments
  if (caller.role === 'hod' && caller.departmentId !== departmentId) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot create accounts for other departments.');
  }

  // Create auth record with random temporary password
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
  const userRecord = await admin.auth().createUser({
    email,
    displayName: fullName,
    password: tempPassword,
    emailVerified: false,
  });

  // Set custom claims
  await admin.auth().setCustomUserClaims(userRecord.uid, {
    role: 'faculty',
    departmentId,
    isActive: true,
  });

  // Create user document in Firestore
  const newUserData = {
    uid: userRecord.uid,
    employeeId,
    fullName,
    email: email.toLowerCase(),
    role: 'faculty',
    departmentId,
    designation: designation || 'Assistant Professor',
    qualification: qualification || 'M.Tech',
    mobileNumber: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    employmentStatus: 'Regular',
    assignedSubjects: [],
    assignedClasses: [],
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await admin.firestore().collection('users').doc(userRecord.uid).set(newUserData);

  // Generate password reset link for secure setup
  const link = await admin.auth().generatePasswordResetLink(email);

  return { success: true, uid: userRecord.uid, inviteLink: link };
});

/**
 * Deactivate faculty account (revokes refresh tokens)
 */
exports.deactivateFacultyAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { targetUid, reason } = data;
  await admin.auth().updateUser(targetUid, { disabled: true });
  await admin.auth().revokeRefreshTokens(targetUid);

  await admin.firestore().collection('users').doc(targetUid).update({
    isActive: false,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: 'Faculty deactivated and sessions revoked.' };
});
