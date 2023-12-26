const { Controller } = require("../lib/cnjs-utils/server");
const nunjucks = require("nunjucks");

/**
 * @typedef {import("winston").Logger} Logger
 * @typedef {import("../services/quality-standard-reader/service")} QualityStandardDataReader
 * @typedef {import("../services/http-error-service/service")} HttpErrorFactory
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */


class QualityStandardController extends Controller {

  /**
   * @param {Logger} logger 
   * @param {QualityStandardDataReader} dataReader 
   */
  constructor(logger, dataReader) {
    super({ logger, baseUrl: "/quality-standards" });

    this.dataReader = dataReader;
  }

  $preprocess() {
    this
      .get("/", this.listQualityStandards(this.dataReader))
      .get("/:id", this.getQualityStandard(this.dataReader))
      .get("/:id/categories/:categoryId", this.getQualityStandardCategory(this.dataReader))
      .get("/:id/categories/:categoryId/items/:item", this.getQualityStandardItem(this.dataReader));
  }

  $postprocess() {
    this.log.info(`${this.constructor.name} Initialized`);
  }

  /**
   * @param {QualityStandardDataReader} dataReader
   */
  listQualityStandards(dataReader) {

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    async function handler(req, res, next) {
      try {
        const si = await dataReader.dataReader.readServiceIndex();
        const item = si.getItem("quality standards");

        item.items = await dataReader.list();

        if (!req.headers['hx-request']) {
          res.status(200).json(item);
        } else {
          res.send(nunjucks.render('_hx-nav-menu.html', {
            items: item.items,
            isLeaf: false,
          }));
        }
      } catch (error) {
        next(error);
      }
    }

    return handler
  }

  /**
   * @param {QualityStandardDataReader} dataReader 
   */
  getQualityStandard(dataReader) {

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
          res.send(nunjucks.render('_hx-nav-menu.html', {
            items: model.items,
            isLeaf: false,
          }));
        }
      } catch (error) {
        next(error);
      }
    }

    return handler
  }

  /**
   * @param {QualityStandardDataReader} dataReader 
   */
  getQualityStandardCategory(dataReader) {

    /**
     * @param {Request} req 
     * @param {Response} res 
     */
    async function handler(req, res, next) {
      const { id, categoryId } = req.params;

      try {
        const model = await dataReader.readQualityStandardCategory(id, categoryId);

        if (!req.headers['hx-request']) {
          res.status(200).json(model);
        } else {
          res.send(nunjucks.render('_hx-nav-menu.html', {
            items: model.items,
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
 * @param {QualityStandardDataReader} dataReader 
 */
  getQualityStandardItem(dataReader) {

    /**
     * @param {Request} req 
     * @param {Response} res 
     */
    async function handler(req, res, next) {
      const { id, item, categoryId } = req.params;

      try {
        const model = await dataReader.readQualityStandardItems(id, categoryId, item);

        if (!req.headers['hx-request']) {
          res.status(200).json(model);
        } else {
          res.setHeader('HX-Replace-Url', '/rules-documentation/' + model.href);
          res.send(nunjucks.render('_hx_main_list.html', { model }));
        }

      } catch (error) {
        next(error);
      }
    }

    return handler
  }
}

module.exports = QualityStandardController;