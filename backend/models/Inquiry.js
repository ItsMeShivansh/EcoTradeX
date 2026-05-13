const db = require('../firebase_config');

/**
 * Inquiry Model
 * Interacts with Firebase Firestore
 */
class Inquiry {
  static async getAll() {
    try {
      const snapshot = await db.collection('inquiries').orderBy('timestamp', 'desc').get();
      const inquiries = [];
      
      snapshot.forEach(doc => {
        inquiries.push({ id: doc.id, ...doc.data() });
      });
      
      return inquiries;
    } catch (err) {
      console.error('Error reading inquiries:', err);
      throw err;
    }
  }

  static async create(data) {
    try {
      const timestamp = new Date().toISOString();
      const submission = { ...data, timestamp };
      const id = `${data.type || 'inquiry'}-${Date.now()}`;
      
      await db.collection('inquiries').doc(id).set(submission);
      return { id, ...submission };
    } catch (err) {
      console.error('Error creating inquiry:', err);
      throw err;
    }
  }

  static async delete(id) {
    try {
      await db.collection('inquiries').doc(id).delete();
      return true;
    } catch (err) {
      console.error(`Error deleting inquiry ${id}:`, err);
      throw err;
    }
  }
}

module.exports = Inquiry;
