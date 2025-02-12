const { Server } = require("../lib/cnjs-utils/server");
const { accessLogFactory } = require("../lib/cnjs-utils/log");
const { types: folderTypes } = require("../services/folder-service");
const { extendAuth } = require("../services/extend-authentication-service");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const { middleware, codes } = require("../services/http-error-service");
const { cacheControl, TIME } = require("./middleware");
const passport = require("passport");
const fs = require("fs");
const path = require("path");
const nunjucks = require("nunjucks");

class RulesDocumentationServer extends Server {

  /**
   * @param {*} logger 
   * @param {*} version 
   * @param {import("../config/configuration").Configuration} configuration 
   * @param {*} httpErrorFactory 
   * @param {*} passportConfigure 
   * @param {*} folderService 
   * @param {*} apiController 
   * @param {*} rulesController 
   * @param {*} renderController 
   * @param {*} publicAssetController 
   */
  constructor(logger, version, configuration, httpErrorFactory, passportConfigure, folderService, apiController, rulesController, renderController, publicAssetController) {
    super({
      https: configuration.https.isValid()
        ? {
          key: fs.readFileSync(path.resolve(configuration.https.key)),
          cert: fs.readFileSync(path.resolve(configuration.https.cert)),
        }
        : null,
      logger,
      name: "Rules Documentation",
      bootMessage: (name, _port) => `${name} ${version} Service started on port ${_port}`,
      contextPath: configuration.contextPath,
      port: configuration.port,
      middleware: [
        accessLogFactory(folderService.get(folderTypes.logs)),
        helmet({
          hidePoweredBy: true,
          hsts: false,
          contentSecurityPolicy: {
            useDefaults: false,
            directives: {
              defaultSrc: ["'self'", "https://*"],
              baseUri: ["'self'"],
              fontSrc: ["'self'", "https://*", "data:"],
              formAction: ["'self'"],
              frameAncestors: ["'self'"],
              scriptSrc: ["'self'", "https://*", "'unsafe-inline'"],
              scriptSrcAttr: null,
              objectSrc: ["'none'"],
              imgSrc: ["'self'", "https://*", "data:"],
              styleSrc: ["'self'", "https://*", "'unsafe-inline'"],
            },
          },
        }),
        cors(),
        middleware.setErrorLocale,
        bodyParser.urlencoded({ limit: "5mb", extended: true }),
        bodyParser.json({ limit: "5mb" }),
        cookieParser(configuration.sessionKey),
        (error, req, res, next) => {
          if (error instanceof SyntaxError) {
            res.status(400).json(httpErrorFactory.createError(req.locale, codes.server.bodyParseError, error.message));
          } else {
            next();
          }
        },
        passport.initialize(),
        extendAuth(),
        cacheControl(TIME.HOUR * 6),
      ],
    }, apiController, rulesController, renderController, publicAssetController);

    this.httpErrorFactory = httpErrorFactory;
    this.passportConfigure = passportConfigure;
    /** @type {import("../services/folder-service/service")} */
    this.folderService = folderService;
    const env = nunjucks.configure(this.folderService.get(folderTypes.views), {
      autoescape: true,
      express: this.app,
      trimBlocks: true,
      lstripBlocks: true,
    });
    env.addGlobal('base_url', configuration.publicUrl);
    env.addGlobal('gbl_year', new Date(Date.now()).getFullYear());
  }

  $preprocess() {
    this.passportConfigure();
  }

  async $postprocess() {
    this.app.use(middleware.errorHandlerMiddleware(this.httpErrorFactory, this.log));
  }
}

module.exports = RulesDocumentationServer;