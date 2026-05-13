const db = require('../firebase_config');

/**
 * Product Model
 * Interacts with Firebase Firestore
 */
class Product {
  static async getAll() {
    try {
      const snapshot = await db.collection('products').get();
      const allProducts = {};
      
      snapshot.forEach(doc => {
        const product = doc.data();
        const cat = product.category || 'uncategorized';
        if (!allProducts[cat]) allProducts[cat] = [];
        // Ensure id is present
        allProducts[cat].push({ id: doc.id, ...product });
      });
      
      return allProducts;
    } catch (err) {
      console.error('Error reading Products:', err);
      throw err;
    }
  }

  // Used strictly if admin wants to replace the entire product JSON array structure.
  static async updateAll(newData) {
    try {
      // For Firestore, "updateAll" is dangerous. It's better to update individual items.
      // But to maintain the interface, we can batch set them.
      const batch = db.batch();
      for (const [category, productsArray] of Object.entries(newData)) {
        if (Array.isArray(productsArray)) {
          for (const product of productsArray) {
            const docRef = product.id 
              ? db.collection('products').doc(product.id) 
              : db.collection('products').doc();
            batch.set(docRef, { ...product, category }, { merge: true });
          }
        }
      }
      await batch.commit();
      return newData;
    } catch (err) {
      console.error('Error batch updating Products:', err);
      throw err;
    }
  }

  static async getByCategory(category) {
    try {
      const snapshot = await db.collection('products').where('category', '==', category).get();
      const products = [];
      snapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
      });
      return products;
    } catch (err) {
      console.error(`Error getting products by category ${category}:`, err);
      throw err;
    }
  }

  static async addProduct(category, productData) {
    try {
      const docRef = productData.id 
        ? db.collection('products').doc(productData.id) 
        : db.collection('products').doc();
        
      const newProduct = { ...productData, category };
      await docRef.set(newProduct);
      return { id: docRef.id, ...newProduct };
    } catch (err) {
      console.error(`Error adding product to category ${category}:`, err);
      throw err;
    }
  }

  static async updateProduct(category, id, updates) {
    try {
      const docRef = db.collection('products').doc(id);
      await docRef.set({ ...updates, category }, { merge: true });
      
      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (err) {
      console.error(`Error updating product ${id} in ${category}:`, err);
      throw err;
    }
  }

  static async deleteProduct(category, id) {
    try {
      await db.collection('products').doc(id).delete();
      return true;
    } catch (err) {
      console.error(`Error deleting product ${id} in ${category}:`, err);
      throw err;
    }
  }
}

module.exports = Product;
