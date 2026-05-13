const db = require('../firebase_config');

/**
 * SiteContent Model
 * Interacts with Firebase Firestore
 */
class SiteContent {
  static async get() {
    try {
      const doc = await db.collection('site_content').doc('main').get();
      if (!doc.exists) return {};
      return doc.data();
    } catch (err) {
      console.error('Error reading SiteContent:', err);
      throw err;
    }
  }

  static async updateAll(newData) {
    try {
      await db.collection('site_content').doc('main').set(newData);
      return newData;
    } catch (err) {
      console.error('Error writing SiteContent:', err);
      throw err;
    }
  }

  static async updateSection(section, data) {
    try {
      const content = await this.get();
      if (typeof content[section] === 'object' && !Array.isArray(content[section])) {
        content[section] = { ...content[section], ...data };
      } else {
        content[section] = data;
      }
      await this.updateAll(content);
      return content[section];
    } catch (err) {
      console.error(`Error updating SiteContent section ${section}:`, err);
      throw err;
    }
  }

  static async addToArray(section, item) {
    try {
      const content = await this.get();
      if (!content[section]) content[section] = [];
      content[section].push(item);
      await this.updateAll(content);
      return content[section];
    } catch (err) {
      console.error(`Error adding to SiteContent array ${section}:`, err);
      throw err;
    }
  }

  static async updateArrayItem(section, index, item) {
    try {
      const content = await this.get();
      if (!content[section] || !content[section][index]) throw new Error('Item not found');
      content[section][index] = item;
      await this.updateAll(content);
      return content[section];
    } catch (err) {
      console.error(`Error updating SiteContent array ${section} at index ${index}:`, err);
      throw err;
    }
  }

  static async removeFromArray(section, index) {
    try {
      const content = await this.get();
      if (!content[section] || !content[section][index]) throw new Error('Item not found');
      content[section].splice(index, 1);
      await this.updateAll(content);
      return content[section];
    } catch (err) {
      console.error(`Error removing from SiteContent array ${section} at index ${index}:`, err);
      throw err;
    }
  }

  static async updateImageRef(key, url) {
    try {
      const content = await this.get();
      if (!content.images) content.images = {};
      content.images[key] = url;
      await this.updateAll(content);
      return content.images;
    } catch (err) {
      console.error(`Error updating image reference ${key}:`, err);
      throw err;
    }
  }
}

module.exports = SiteContent;
