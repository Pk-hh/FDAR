const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Scheduled daily reminder at 04:00 PM IST (10:30 AM UTC) to remind faculty members
 * with pending daily registers (Section 19)
 */
exports.sendDailySubmissionReminder = functions.pubsub
  .schedule('30 10 * * 1-6') // 10:30 UTC = 16:00 IST Monday to Saturday
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const db = admin.firestore();
    const today = new Date().toISOString().split('T')[0];

    // Check if today is an active holiday
    const holidaySnap = await db.collection('holidays').where('date', '==', today).get();
    if (!holidaySnap.empty) {
      console.log('Today is a designated holiday. Skipping daily submission reminder.');
      return null;
    }

    // Get all active faculty members
    const facultySnap = await db
      .collection('users')
      .where('role', '==', 'faculty')
      .where('isActive', '==', true)
      .get();

    const batch = db.batch();
    for (const facultyDoc of facultySnap.docs) {
      const faculty = facultyDoc.data();
      const logId = `${facultyDoc.id}_${today}`;
      const logSnap = await db.collection('dailyLogs').doc(logId).get();

      // If log not submitted yet, send notification
      if (!logSnap.exists || logSnap.data().submissionStatus === 'draft') {
        const notifRef = db.collection('notifications').doc();
        batch.set(notifRef, {
          userId: facultyDoc.id,
          title: 'Daily Register Submission Reminder',
          message: 'College hours have concluded for today. Please complete all 7 period entries and submit your daily register.',
          type: 'reminder',
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    await batch.commit();
    return null;
  });
