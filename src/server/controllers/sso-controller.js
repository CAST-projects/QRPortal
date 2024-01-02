/* eslint-disable new-cap */
const { Controller } = require("../lib/cnjs-utils/server");
const { sign } = require("jsonwebtoken");
const { localAuth } = require("../services/extend-authentication-service");
const { createSHA256Hash } = require("../lib/cnjs-utils/services/crypto");
const { TimeConverter } = require("../lib/cnjs-utils/lib/time-converter");

/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("../services/extend-authentication-service/sso-data-cache")} SSOCache
 */

class SSOController extends Controller {

  /**
   * @param {import("../config/configuration").Configuration} configuration
   * @param {import("winston".Logger)} logger
   * @param {SSOCache} ssoCache
   */
  constructor(logger, configuration, ssoCache) {
    super({ logger, baseUrl: "/sso" });

    this.sessionKey = configuration.sessionKey;
    this.ssoCache = ssoCache;
  }

  $preprocess() {
    this.post("/authenticate", localAuth(), this.authenticate(this.sessionKey, this.ssoCache));
  }

  /**
   * @param {string} sessionKey
   * @param {SSOCache} ssoCache
   */
  authenticate(sessionKey, ssoCache) {

    /**
     * @param {Request} req
     * @param {Response} res
     */
    async function handler(req, res) {
      const user = req.user;
      const uid = await createSHA256Hash(user.apikey);
      const userInfo = {
        fullname: user.fullname,
        firstname: user.firstname,
        lastname: user.lastname,
        iconUrl: user.iconurl,
      };

      ssoCache.store(uid, userInfo);

      const jwt = sign({
        uid,
      }, sessionKey, {
        algorithm: "HS512",
        expiresIn: "1d",
      });

      if (req.headers['hx-request']) {
        res.cookie('SESSION', jwt, {
          path: "/",
          sameSite: true,
          expires: new TimeConverter().addDays(1).toDate()
        });
        res.sendStatus(200);
      } else {
        res.status(200).json({
          jwt: sign({
            uid,
          }, sessionKey, {
            algorithm: "HS512",
            expiresIn: "1d",
          }),
          expires: new TimeConverter().addDays(1).toDate(),
          ...userInfo,
        });
      }
    }

    return handler
  }
}

module.exports = SSOController;