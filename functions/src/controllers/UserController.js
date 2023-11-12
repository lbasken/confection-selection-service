const jwt = require("jsonwebtoken");
const Firebase = require("../services/Firebase");
const Authorization = require("../services/Authorization");
const UserService = require("../services/UserService");

class UserController {

  static start(app) {

    // Generate an invitation link
    app.post("/api/v1/user/invite", async (request, response) => {
      const user = await Firebase.auth.getUserByEmail(request.body.email);
      if (user) { return response.status(409).send({}); }
      if (!Authorization.userCanAccess(request.user)) { return response.status(403).send({}); }
      const invitations = await UserService.getOpenInvitationsForEmail(request.body.email);
      if (invitations?.length) { return response.send({invitation: invitations[0]}); }
      const invitation = await UserService.createInvitation(request.body.email);
      response.send({invitation});
    });

    app.post("/api/v1/user/:email/invited", async (request, response) => {
      if (!Authorization.userCanAccess(request.user)) { return response.status(403).send({}); }
      const invitations = await UserService.getOpenInvitationsForEmail(request.params.email);
      if (invitations?.length) {
        for (const invitation of invitations) {
          const id = invitation.id;
          delete invitation.id;
          invitation.status = "accepted";
          await Firebase.firestore.collection("invitations").doc(id).set(invitation);
        }
      }
      response.send({});
    });

    // DELETE (primarily used to delete an account that was created during sign-in)
    app.delete("/api/v1/user/:id", async (request, response) => {
      if (!Authorization.userCanAccess(request.user, request.user, user => user.uid === request.params.id)) { return response.status(403).send({}); }
      await Firebase.auth.deleteUser(request.user.uid);
      response.send({});
    });

    // LIST
    app.get("/api/v1/user", async (request, response) => {
      if (!Authorization.userCanAccess(request.user)) { return response.status(403).send({}); }
      const result = await Firebase.auth.listUsers();
      response.send(result?.users.map(UserController.getBasicUserObject));
    });

  }

  static getBasicUserObject(user) {
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    }
  }

}

module.exports = UserController;
