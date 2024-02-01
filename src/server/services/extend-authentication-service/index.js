module.exports = {
  ...require("./middleware"),
  ...require("./passport-configuration"),
  ...require("./lib"),
  SSOCache: require("./sso-data-cache"),
  ExtendAuthWebClient: require("./auth-web-client"),
};