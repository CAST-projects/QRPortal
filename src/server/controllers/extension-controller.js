const { Controller } = require("../lib/cnjs-utils/server");
const nunjucks = require("nunjucks");
const { stream } = require("../lib/stream");

/**
 * @typedef {import("winston").Logger} Logger
 * @typedef {import("../services/extension-service/service")} ExtensionDataReader
 * @typedef {import("../services/http-error-service/service")} HttpErrorFactory
 * @typedef {import("../config/configuration").Configuration} Configuration
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

class ExtensionController extends Controller {

  /**
   * @param {Logger} logger 
   * @param {ExtensionDataReader} dataReader 
   * @param {Configuration} configuration
   */
  constructor(logger, dataReader, configuration) {
    super({ logger, baseUrl: "/extensions" });

    this.dataReader = dataReader;
    this.configuration = configuration;
  }

  async $preprocess() {
    await this.dataReader.initMapping();

    this
      .get("/", this.listExtensions(this.dataReader))
      .get("/:id", this.getExtension(this.dataReader))
      .get("/:id/versions/:version", this.getExtensionVersion(this.dataReader, this.configuration.contextPath));
  }

  $postprocess() {
    this.log.info(`${this.constructor.name} Initialized`);
  }

  /**
   * @param {ExtensionDataReader} dataReader 
   */
  listExtensions(dataReader) {

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    async function handler(req, res, next) {
      try {
        const si = await dataReader.dataReader.readServiceIndex();
        const item = si.getItem("extensions");

        item.items = await dataReader.list();

        if (!req.headers['hx-request']) {
          res.status(200).json(item);
        } else {
          res.send(nunjucks.render('_hx-nav-menu.html', {
            items: stream(item.items)
              .filter(_ => _.hasRules)
              .map(_ => ({ ..._, ignoreTitleTransform: true }))
              .collect(),
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
   * @param {ExtensionDataReader} dataReader 
   */
  getExtension(dataReader) {

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
 * @param {ExtensionDataReader} dataReader 
 * @param {string} contextPath 
 */
  getExtensionVersion(dataReader, contextPath = '') {

    /**
     * @param {Request} req 
     * @param {Response} res 
     */
    async function handler(req, res, next) {
      const { id, version } = req.params;

      try {
        const model = await dataReader.readVersion(id, version);

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

module.exports = ExtensionController;