const locales = require("./locales");
const ecodes = require("./error-codes");
const { ErrorStack, ErrorResponse } = require("../../lib/cnjs-utils/server/http-error-v2");
const { JsonFileNotFoundError } = require("../json-file-reader/exceptions");

/**
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
function setErrorLocale(req, _res, next) {
  const language = req.headers["accept-language"] || "en-US";
  const [locale] = language.split("-");

  switch (locale) {
    case locales.en:
      req.locale = locales.en;
      break;
    case locales.fr:
      req.locale = locales.fr;
      break;
    default:
      req.locale = locales.en;
      break;
  }

  next();
}

/**
 * @param {import("./service")} httpErrorFactory 
 * @param {import("winston").Logger} logger 
 */
function errorHandlerMiddleware(httpErrorFactory, logger) {
  return (error, req, res, next) => {

    if (error instanceof Error) {
      if (error instanceof JsonFileNotFoundError) {
        if (!req.path.toLowerCase().startsWith('/api/')) {
          res.redirect('/');
        } else {
          res.sendStatus(404);
        }
      } else {
        logger.error(error.stack);
        res.status(500).json(httpErrorFactory.createError(req.locale, ecodes.server.internalServerError));
      }
    } else if (error instanceof ErrorStack) {
      res.status(400).json(error.flush(ecodes.validation.generic));
    } else if (error instanceof ErrorResponse) {
      res.status(400).json(error);
    } else {
      next();
    }
  }
}

module.exports = {
  setErrorLocale,
  errorHandlerMiddleware,
};