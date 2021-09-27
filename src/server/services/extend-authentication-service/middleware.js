
function localAuth(){
  const passport = require("passport");

  return passport.authenticate("local", { session: false });
}

function jwtAuth(){
  const passport = require("passport");

  return (req, res, next) => passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    req.user = user;
    next();
  })(req, res, next);
}

module.exports = {
  localAuth,
  jwtAuth,
};