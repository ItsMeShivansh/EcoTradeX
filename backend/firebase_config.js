const admin = require('firebase-admin');

function getServiceAccount() {
  const env = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!env) return require('./serviceAccountKey.json');

  try {
    return JSON.parse(env);
  } catch (err) {
    try {
      const decoded = Buffer.from(env, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (err2) {
      console.error('FIREBASE_SERVICE_ACCOUNT is not valid JSON or base64-encoded JSON');
      throw err2;
    }
  }
}

const serviceAccount = getServiceAccount();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;