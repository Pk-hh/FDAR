const admin = require('firebase-admin');
admin.initializeApp();

const auth = require('./auth');
const faculty = require('./faculty');
const dailyLogs = require('./dailyLogs');
const notifications = require('./notifications');

exports.setCustomClaims = auth.setCustomClaims;
exports.createFacultyAccount = faculty.createFacultyAccount;
exports.deactivateFacultyAccount = faculty.deactivateFacultyAccount;
exports.onDailyLogSubmitted = dailyLogs.onDailyLogSubmitted;
exports.onDailyLogApproved = dailyLogs.onDailyLogApproved;
exports.sendDailySubmissionReminder = notifications.sendDailySubmissionReminder;
