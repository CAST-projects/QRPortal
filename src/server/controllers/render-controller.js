const { Controller } = require("../lib/cnjs-utils/server");
const nunjucks = require("nunjucks");

/**
 * @typedef {import("winston").Logger} Logger
 * @typedef {import("../services/context-data-reader/reader")} ContextDataReader
 * @typedef {import("../services/http-error-service/service")} HttpErrorFactory
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

class RenderController extends Controller {

  /**
   * @param {ContextDataReader} contextDataReader
   * @param {Logger} logger 
   */
  constructor(contextDataReader, logger) {
    super({
      logger: logger,
      baseUrl: "/rules-documentation",
    });

    this.contextDataReader = contextDataReader;
  }

  async $preprocess() {
    this.get("/", this.index(this.contextDataReader));
    this.makeEndPoints('business-criteria', this.businessCriteriaList);
    this.makeEndPoints('technologies', this.technologiesList);
  }

  $postprocess() {
    this.log.info(`${this.constructor.name} Initialized`);
  }

  makeEndPoints(type, handler) {
    const base = `/:context/${type}/:id`;
    this.get(base, handler(this.contextDataReader, this.genericHandler));
    this.get(`${base}/details/:ruleId`, handler(this.contextDataReader, this.genericHandler));
  }

  async getQualityStandards() {
    const dataReader = this.contextDataReader.qualityStandardDataReader;
    const si = await dataReader.dataReader.readServiceIndex();
    const item = si.getItem("quality standards");

    item.items = [];

    let stds = await dataReader.list();

    for (const std of stds) {
      let stdInfo = await dataReader.read(std.name);
      std.items = [];

      for (const category of stdInfo.items) {
        let stdCatInfo = await dataReader.readQualityStandardCategory(std.name, category.name);

        for (const stdCatInfoItem of stdCatInfo.items) {
          stdCatInfoItem.leaf = true;
        }

        std.items.push(stdCatInfo);
      }
      item.items.push(std)
    }

    return item;
  }

  /**
   * @param {ContextDataReader} contextDataReader 
   */
  index(contextDataReader) {
    /**
     * 
     * @param {Request} req
     * @param {Response} res
     */
    async function handler(req, res, next) {
      try {
        const reader = contextDataReader.businessCriteriaDataReader.dataReader;
        const si = await reader.readServiceIndex();
        const tmpl = nunjucks.render('welcome.html', {
          navbar: si.items,
        });

        res.send(tmpl);
      } catch (error) {
        next(error);
      }

    }

    return handler;
  }

  /**
   * @param {ContextDataReader} contextDataReader 
   * @param {Any[]} navbar 
   */
  businessCriteriaList(contextDataReader, handler) {
    return handler(
      contextDataReader,
      contextDataReader.businessCriteriaDataReader.read.bind(contextDataReader.businessCriteriaDataReader)
    );
  }

  /**
   * @param {ContextDataReader} contextDataReader 
   * @param {Any[]} navbar 
   */
  technologiesList(contextDataReader, handler) {
    return handler(
      contextDataReader,
      contextDataReader.technologyDataReader.readTechnology.bind(contextDataReader.technologyDataReader),
      _ => _.toApiOutput(),
    );
  }

  /**
  * @param {ContextDataReader} contextDataReader 
  */
  genericHandler(contextDataReader, findById, transform) {
    /**
     * 
     * @param {Request} req
     * @param {Response} res
     */
    async function handler(req, res, next) {
      const { id, ruleId } = req.params;
      const reader = contextDataReader.businessCriteriaDataReader.dataReader;
      const qrReader = contextDataReader.qualityRuleDataReader;

      try {
        const si = await reader.readServiceIndex();
        let details;
        if (ruleId) {
          const qualityRule = await qrReader.read(ruleId);
          details = qualityRule.toPublicOutput();
        }
        const item = await findById(id);

        if (!item) return res.sendStatus(404);

        const model = transform ? transform(item) : item;
        const tmpl = nunjucks.render('data_navigation.html', {
          model,
          navbar: si.items,
          details,
        });

        res.send(tmpl);
      } catch (error) {
        next(error);
      }

    }

    return handler;
  }
}

module.exports = RenderController;