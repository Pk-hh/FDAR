const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Set custom role claims for authenticated users
 */
exports.setCustomClaims = functions.https.onCall(async (data, context) => {
  // Principal authorization check
  if (!context.auth || context.auth.token.role !== 'principal') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only the Principal can set custom user roles.'
    );
  }

  const { uid, role, departmentId } = data;
  if (!uid || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'UID and Role are required.');
  }

  await admin.auth().setCustomUserClaims(uid, {
    role,
    departmentId: departmentId || '',
    isActive: true,
  });

  return { success: true, message: `Claims set for user ${uid}` };
});
