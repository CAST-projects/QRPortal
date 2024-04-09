const { containsApiKeyHeader } = require("./lib");

function localAuth() {
  const passport = require("passport");

  return (req, res, next) => passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    req.user = user;
    next();
  })(req, res, next);
}

function jwtAuth(req, res, next) {
  const passport = require("passport");

  return passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    req.user = user;
    next();
  })(req, res, next);
}

const apikeyAuth = (req, res, next) => {
  const passport = require("passport");

  return passport.authenticate("apikey", { session: false }, (err, user, info) => {
    if (err) return next(err);
    req.user = user;
    next();
  })(req, res, next);
}

const extendAuth = () => {
  return (req, res, next) => {
    if (containsApiKeyHeader(req)) {
      return apikeyAuth(req, res, next);
    }

    return jwtAuth(req, res, next);
  };
}

module.exports = {
  localAuth,
  jwtAuth,
  apikeyAuth,
  extendAuth,
};