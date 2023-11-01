const admin = require("firebase-admin");

class Firebase {

  static get auth() {
    return Firebase.firebase.auth();
  }

  static get firestore() {
    return Firebase.firebase.firestore();
  }

  static get firebase() {
    if (!Firebase._firebase) {
      Firebase._firebase = admin.initializeApp();
    }
    return Firebase._firebase;
  }

  static async create(collection, data) {
    const document = await Firebase.firestore
      .collection(collection)
      .add(data);
    return await Firebase.read(collection, document.id);
  }

  static async read(collection, id) {
    const snapshot = await Firebase.firestore
      .collection(collection)
      .doc(id)
      .get();
    return Firebase.getSnapshotData(snapshot);
  }

  static async update(collection, id, data) {
    await Firebase.firestore
      .collection(collection)
      .doc(id)
      .update(data);
    return Firebase.read(collection, id);
  }

  static async delete(collection, id) {
    await Firebase.firestore
      .collection(collection)
      .doc(id)
      .delete()
  }

  static async list(collection) {
    const snapshot = await Firebase.firestore
      .collection(collection)
      .get();
    return snapshot.docs.map(Firebase.getSnapshotData);
  }

  static getSnapshotData(snapshot) {
    return {...snapshot.data(), id: snapshot.ref.id}
  }

}

module.exports = Firebase;
