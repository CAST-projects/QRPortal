const locales = require("./locales");
const ecodes = require("./error-codes");

module.exports = {
  // example entry
  [ecodes["error example"]]: {
    message: {
      [locales.en]: "message for this locale"
    },
    details: {
      [locales.en]: "details for this locale"
    },
  },
  [ecodes.server.internalServerError]: {
    message: {
      [locales.en]: "Internal Server Error",
      [locales.fr]: "Error Interne Server",
    },
    details: {
      [locales.en]: "An unexpected error has occured on the server side, if you encounter this error please report it to the service administrator",
    }
  },
  [ecodes.validation.generic]: {
    message: {
      [locales.en]: "Validation error",
    },
    details: {
      [locales.en]: "A validation error occured when evaluating data that was transmitted to the server from the client",
    }
  }
};