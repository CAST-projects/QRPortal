/* eslint-disable new-cap */
const { Controller } = require("../lib/cnjs-utils/server");
const { sign } = require("jsonwebtoken");
const { localAuth } = require("../services/extend-authentication-service");
const { createSHA256Hash } = require("../lib/cnjs-utils/services/crypto");
const { TimeConverter } = require("../lib/cnjs-utils/lib/time-converter");
const nunjucks = require("nunjucks");
const { first } = require("../lib/str");

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
    this.post("/signout", this.signout(this.ssoCache));
  }

  /**
   * @param {SSOCache} ssoCache
   */
  signout(ssoCache) {

    /**
     * @param {Request} req
     * @param {Response} res
     */
    async function handler(req, res) {
      try {

      } catch (error) {

      }
      const user = req.user;

      if (!user) {
        return res.sendStatus(403);
      }

      ssoCache.clear(user.uid);

      if (req.headers['hx-request']) {
        res.clearCookie('SESSION', {
          path: "/",
        });
        res.setHeader('HX-Refresh', 'true');

        res.status(200).send(nunjucks.render('header.html', { user: null }));
      } else {
        res.status(204);
      }

    }

    return handler;
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

      if (!user) {
        if (req.headers['hx-request']) {
          return res.status(401).send(nunjucks.render('auth_error.html'))
        } else {
          return res.sendStatus(401);
        }
      }

      const uid = await createSHA256Hash(user.apikey);
      const userInfo = {
        uid,
        fullname: user.fullname,
        firstname: user.firstname,
        lastname: user.lastname,
        iconUrl: user.iconurl,
        initials: first(user.firstname).toUpperCase() + first(user.lastname).toUpperCase()
      };

      ssoCache.store(uid, userInfo);

      const jwt = sign({
        uid,
      }, sessionKey, {
        algorithm: "HS512",
        expiresIn: "1d",
      });

      if (req.headers['hx-request']) {
        res.setHeader('HX-Refresh', 'true');
        res.cookie('SESSION', jwt, {
          path: "/",
          sameSite: true,
          expires: new TimeConverter().addDays(1).toDate()
        });

        res.status(200).send(nunjucks.render('auth_success.html', { user }));
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