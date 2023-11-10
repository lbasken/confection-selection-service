const Firebase = require("../services/Firebase");
const jwt = require("jsonwebtoken");

class UserService {

  static SECRET = "tell him yes on one and no on two";

  static async getOpenInvitationsForEmail(email) {
    const snapshot = await Firebase.firestore
      .collection("invitations")
      .where("email", "==", email)
      .where("status", "!=", "accepted")
      .get();
    return snapshot.docs.map(document => ({id: document.ref.id, ...document.data()}));
  }

  static async getInvitationsForEmail(email) {
    const snapshot = await Firebase.firestore
      .collection("invitations")
      .where("email", "==", email)
      .get();
    return snapshot.docs.map(document => ({id: document.ref.id, ...document.data()}));
  }

  static async createInvitation(email) {
    const payload = {email};
    const token = jwt.sign(payload, UserService.SECRET, {expiresIn: "1w"});
    const invitation = {email: email, token, created: Date.now(), status: "created"};
    await Firebase.firestore.collection("invitations").add(invitation);
    return invitation;
  }

}

module.exports = UserService;
