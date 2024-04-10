/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

/**
 * @param {Request} req 
 */
function noopCb() { }

/**
 * @param {Response} res
 * @param {number} sec 
 */
function setCacheControl(res, sec) {
  res.set('Cache-Control', `max-age=${sec}, must-revalidate`);
}

/**
 * @param {number} sec 
 */
function cacheControl(sec = 0) {

  const setter = sec !== 0 ? setCacheControl : noopCb;
  /**
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   */
  function handler(_req, res, next) {
    setter(res, sec);
    next();
  }

  return handler;
}

const TIME = {
  HOUR: 3600,
  MIN: 60,
  SEC: 1,
}

module.exports = {
  cacheControl,
  TIME,
};