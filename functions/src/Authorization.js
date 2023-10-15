class Authorization {

  static can(user, resource, filter) {
    if (!user) { return false; }
    if (user.role === "admin") { return true; }
    return filter ? filter(user, resource) : false;
  }

}

module.exports = Authorization;