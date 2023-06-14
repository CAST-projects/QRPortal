const { Server } = require("../lib/cnjs-utils/server");
const { accessLogFactory } = require("../lib/cnjs-utils/log");
const { types: folderTypes } = require("../services/folder-service");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const { middleware, codes } = require("../services/http-error-service");
const passport = require("passport");
const fs = require("fs");
const path = require("path");

class RulesDocumentationServer extends Server {
  
  constructor(logger, version, configuration, httpErrorFactory, passportConfigure, folderService, apiController, publicController, rulesController){
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
          contentSecurityPolicy: {
            useDefaults: true,
            directives: {
              scriptSrc: ["'self'", "https://*", "'unsafe-inline'"],
              scriptSrcAttr: null,
              imgSrc: ["'self'","https://*", "data:"],
              styleSrc: ["'self'", "https://*", "'unsafe-inline'"],
            }
          },
        }),
        cors(),
        middleware.setErrorLocale,
        bodyParser.urlencoded({ limit: "5mb", extended: true}),
        bodyParser.json({ limit: "5mb" }),
        (error, req, res, next) => {
          if (error instanceof SyntaxError) {
            res.status(400).json(httpErrorFactory.createError(req.locale, codes.server.bodyParseError, error.message));
          } else {
            next();
          }
        },
        cookieParser(),
        passport.initialize(),
      ],
    }, apiController, rulesController, publicController);

    this.httpErrorFactory = httpErrorFactory;
    this.passportConfigure = passportConfigure;
  }

  $preprocess(){
    this.passportConfigure();
  }

  async $postprocess(){
    this.app.use(middleware.errorHandlerMiddleware(this.httpErrorFactory, this.log));
  }
}

module.exports = RulesDocumentationServer;