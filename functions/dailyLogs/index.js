const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Triggered on daily log update to handle submission notifications & audit
 */
exports.onDailyLogSubmitted = functions.firestore
  .document('dailyLogs/{logId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check transition to submitted
    if (before.submissionStatus !== 'submitted' && after.submissionStatus === 'submitted') {
      const db = admin.firestore();

      // Find department HOD
      const hodQuery = await db
        .collection('users')
        .where('departmentId', '==', after.departmentId)
        .where('role', '==', 'hod')
        .where('isActive', '==', true)
        .get();

      const batch = db.batch();
      hodQuery.docs.forEach((doc) => {
        const notifRef = db.collection('notifications').doc();
        batch.set(notifRef, {
          userId: doc.id,
          title: 'Daily Register Submitted',
          message: `${after.facultyName} (${after.employeeId}) has submitted daily register for ${after.date}.`,
          type: 'submission',
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    }
  });

/**
 * Triggered on daily log approval to lock and notify faculty
 */
exports.onDailyLogApproved = functions.firestore
  .document('dailyLogs/{logId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.submissionStatus !== 'approved' && after.submissionStatus === 'approved') {
      const db = admin.firestore();
      await db.collection('notifications').add({
        userId: after.facultyId,
        title: 'Daily Register Approved',
        message: `Your daily activity register for ${after.date} has been reviewed and approved.`,
        type: 'approval',
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });
