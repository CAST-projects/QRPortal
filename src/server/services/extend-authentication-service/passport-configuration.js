/**
 * @param {import("./auth-web-client")} webClient
 * @param {string} accessKey
 * @param {import("./sso-data-cache")} dataCache
 */
function passportConfigure(webClient, accessKey, dataCache) {
  const passport = require("passport");
  const LocalStrategy = require("passport-local").Strategy;
  const { ExtractJwt, Strategy: JwtStrategy } = require("passport-jwt");

  passport.serializeUser((user, done) => {
    return done(null, user);
  });

  passport.deserializeUser((userKey, done) => {
    const user = dataCache.get(userKey);

    if (!user) return done(null, null);

    done(null, user);
  });

  passport.use("local",
    new LocalStrategy({
      usernameField: "uid",
      passwordField: "pwd",
      passReqToCallback: false,
      session: false,
    }, async (username, password, done) => {
      try {
        let user;

        user = await webClient.signin(username, password);

        if (!user) return done(null, false);

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  function cookieExtractor(req) {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies['SESSION'];
    }
    return token;
  }

  passport.use("jwt",
    new JwtStrategy({
      secretOrKey: accessKey,
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      passReqToCallback: false,
      algorithms: "HS512",
      jsonWebTokenOptions: {
        maxAge: "1d",
      },
    }, async (payload, done) => {
      try {
        const user = dataCache.get(payload.uid);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));
}

module.exports = {
  passportConfigure,
};