const Firebase = require("../services/Firebase");

class UserMiddleware {

  static getTokenFromRequest(request) {
    if (request.headers.authorization) {
      const authorization = request.headers.authorization || "";
      const match = authorization.match(/Bearer (.+)/);
      return match.length > 1 ? match[1] : "";
    } else {
      return request.body.token  || request.query["token"] || "";
    }
  }

  static async getIdToken(request) {
    let token = UserMiddleware.getTokenFromRequest(request);
    if (token) {
      try {
        return await Firebase.auth.verifyIdToken(token);
      } catch (error) {
        console.error(error.message);
      }
    }
    return undefined;
  }

  static async filter(request, response, next) {
    try {
      const idToken = await UserMiddleware.getIdToken(request);
      if (idToken) {
        request.user = await Firebase.auth.getUser(idToken.uid);
        request.user.role = request.user?.customClaims?.role ?? "user";
      }
    } catch (error) {
      console.error(error.message);
    }
    next();
  }

}

module.exports = UserMiddleware;
