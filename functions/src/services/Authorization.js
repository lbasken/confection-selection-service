class Authorization {

  static userCanAccess(user, resource, filter) {
    if (!user) { return false; }
    if (user.role === "admin") { return true; }
    if (!resource) { return true; }
    return filter ? filter(user, resource) : false;
  }

}

module.exports = Authorization;
