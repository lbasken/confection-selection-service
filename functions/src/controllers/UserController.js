const Firebase = require("../Firebase");
const Authorization = require("../Authorization");

class UserController {

  static start(app) {

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
