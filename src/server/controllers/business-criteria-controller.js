const { Controller } = require("../lib/cnjs-utils/server");
const nunjucks = require("nunjucks");

/**
 * @typedef {import("winston").Logger} Logger
 * @typedef {import("../services/business-criteria-reader/reader")} DataReader
 * @typedef {import("../services/http-error-service/service")} HttpErrorFactory
 * @typedef {import("../config/configuration").Configuration} Configuration
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

class BusinessCriteriaController extends Controller {

  /**
   * @param {Logger} logger 
   * @param {DataReader} dataReader 
   * @param {Configuration} configuration
   */
  constructor(logger, dataReader, configuration) {
    super({ logger, baseUrl: "/business-criteria" });

    this.dataReader = dataReader;
    this.configuration = configuration;
  }

  async $preprocess() {
    this
      .get("/", this.listAll(this.dataReader))
      .get("/:id", this.getInfo(this.dataReader, this.configuration.contextPath));
  }

  $postprocess() {
    this.log.info(`${this.constructor.name} Initialized`);
  }

  /**
   * @param {DataReader} dataReader 
   */
  listAll(dataReader) {

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    async function handler(req, res, next) {
      try {
        const si = await dataReader.dataReader.readServiceIndex();
        const item = si.getItem("business criteria");
        const list = await dataReader.list();

        item.items = list.filter(_ => _.id < 1000000);

        if (!req.headers['hx-request']) {
          res.status(200).json(item);
        } else {
          res.send(nunjucks.render('_hx-nav-menu.html', {
            items: item.items,
            isLeaf: true,
          }));
        }
      } catch (error) {
        next(error);
      }
    }

    return handler
  }

  /**
   * @param {DataReader} dataReader
   * @param {string} contextPath 
   */
  getInfo(dataReader, contextPath = "") {

    /**
     * @param {Request} req 
     * @param {Response} res 
     */
    async function handler(req, res, next) {
      const { id } = req.params;

      try {
        const model = await dataReader.read(id);

        if (!req.headers['hx-request']) {
          res.status(200).json(model);
        } else {
          res.setHeader('HX-Replace-Url', contextPath + model.href);
          res.send(nunjucks.render('_hx_main_list.html', { model }));
        }
      } catch (error) {
        next(error);
      }
    }

    return handler
  }
}

module.exports = BusinessCriteriaController;