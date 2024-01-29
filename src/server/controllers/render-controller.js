const { Controller } = require("../lib/cnjs-utils/server");
const nunjucks = require("nunjucks");
const { parseQuery } = require("../services/quality-rule-reader/lib");

/**
 * @typedef {import("winston").Logger} Logger
 * @typedef {import("../services/context-data-reader/reader")} ContextDataReader
 * @typedef {import("../services/http-error-service/service")} HttpErrorFactory
 * @typedef {import("./quality-rules-controller").QualityRuleSearchIndex} QualityRuleSearchIndex
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

class RenderController extends Controller {

  /**
   * @param {ContextDataReader} contextDataReader
   * @param {Logger} logger 
   * @param {QualityRuleSearchIndex} publicSearchIndex
   * @param {QualityRuleSearchIndex} privateSearchIndex
   */
  constructor(contextDataReader, logger, configuration, publicSearchIndex, privateSearchIndex) {
    super({
      logger: logger,
      baseUrl: "/",
    });

    this.configuration = configuration;
    this.contextDataReader = contextDataReader;
    this.publicSearchIndex = publicSearchIndex;
    this.privateSearchIndex = privateSearchIndex;
  }

  async $preprocess() {
    this.get("/", this.index(this.contextDataReader));
    this.get("/s-reset", this.searchReset(this.configuration));
    this.get("/search/:query", this.searchHandler(this.contextDataReader, this.publicSearchIndex, this.privateSearchIndex));
    this.get("/search/:query/details/:ruleId", this.searchHandler(this.contextDataReader, this.publicSearchIndex, this.privateSearchIndex));
    this.makeEndPoints('business-criteria', this.businessCriteriaList);
    this.makeEndPoints('technologies', this.technologiesList);
    this.get("/:context/quality-standards/:standard/categories/:category/items/:itemId",
      this.qualityStandardsHandler(this.contextDataReader));
    this.get("/:context/quality-standards/:standard/categories/:category/items/:itemId/details/:ruleId",
      this.qualityStandardsHandler(this.contextDataReader));
    this.get('/:context/extensions/:id/versions/:version', this.extensionsHandler(this.contextDataReader));
    this.get('/:context/extensions/:id/versions/:version/details/:ruleId', this.extensionsHandler(this.contextDataReader));
  }

  $postprocess() {
    this.log.info(`${this.constructor.name} Initialized`);
  }

  makeEndPoints(type, handler) {
    const base = `/:context/${type}/:id`;
    this.get(base, handler(this.contextDataReader, this.genericHandler));
    this.get(`${base}/details/:ruleId`, handler(this.contextDataReader, this.genericHandler));
  }

  /**
   * @param {ContextDataReader} contextDataReader 
   * @param {QualityRuleSearchIndex} publicSI 
   * @param {QualityRuleSearchIndex} privateSI 
   */
  searchHandler(contextDataReader, publicSI, privateSI) {

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    async function handler(req, res, next) {
      const { ruleId, query } = req.params;
      const { by } = req.query;
      const user = req.user;
      const searchIndex = user ? privateSI : publicSI;
      const dataReader = contextDataReader.qualityRuleDataReader;

      try {
        let details;
        if (ruleId) {
          const qualityRule = await dataReader.read(ruleId);

          details = user ? qualityRule : qualityRule.toPublicOutput();
        }

        const _query = parseQuery(query);
        const _by = searchIndex.getSearchBy(by);

        let results = searchIndex.search(_query, _by);
        if (results.length === 0) results = searchIndex.looseSearch(_query, _by);
        const ids = results.map(_ => _.ref);
        const qualityRules = await dataReader.listQualityRuleReferences(ids);
        const model = { name: "quality rules search", href: "/quality-rules", qualityRules };
        const si = await dataReader.dataReader.readServiceIndex();

        res.send(nunjucks.render('data_navigation_search.html', {
          query,
          searchBy: _by,
          model,
          navbar: si.items,
          details,
          csrf: 'tokex',
          user,
        }));

      } catch (error) {
        next(error);
      }
    }

    return handler
  }

  /**
   * @param {Configuration} config 
   */
  searchReset(config) {

    /**
     * @param {Request} _req
     * @param {Response} res
     * @param {NextFunction} next
     */
    function handler(_req, res, next) {
      try {
        res.setHeader('HX-Replace-Url', config.contextPath ? config.contextPath : "/");
        res.send(nunjucks.render('_welcome.html'));
      } catch (error) {
        next(error);
      }
    }

    return handler;
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
  extensionsHandler(contextDataReader, transform) {
    /**
     * 
     * @param {Request} req
     * @param {Response} res
     */
    async function handler(req, res, next) {
      const { version, id, ruleId } = req.params;
      const user = req.user;
      const reader = contextDataReader.extensionDataReader.dataReader;
      const qrReader = contextDataReader.qualityRuleDataReader;

      try {
        const si = await reader.readServiceIndex();
        let details;
        if (ruleId) {
          const qualityRule = await qrReader.read(ruleId);

          details = user ? qualityRule : qualityRule.toPublicOutput();
        }
        const item = await contextDataReader.extensionDataReader.readVersion(id, version);

        if (!item) return res.sendStatus(404);

        const model = transform ? transform(item) : item;
        const tmpl = nunjucks.render('data_navigation.html', {
          model,
          navbar: si.items,
          details,
          csrf: 'tokex',
          user,
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
  */
  qualityStandardsHandler(contextDataReader, transform) {
    /**
     * 
     * @param {Request} req
     * @param {Response} res
     */
    async function handler(req, res, next) {
      const { standard, category, itemId, ruleId } = req.params;
      const user = req.user;
      const reader = contextDataReader.qualityStandardDataReader.dataReader;
      const qrReader = contextDataReader.qualityRuleDataReader;

      try {
        const si = await reader.readServiceIndex();
        let details;
        if (ruleId) {
          const qualityRule = await qrReader.read(ruleId);

          details = user ? qualityRule : qualityRule.toPublicOutput();
        }
        const item = await contextDataReader.qualityStandardDataReader.readQualityStandardItems(standard, category, itemId)

        if (!item) return res.sendStatus(404);

        const model = transform ? transform(item) : item;
        const tmpl = nunjucks.render('data_navigation.html', {
          model,
          navbar: si.items,
          details,
          csrf: 'tokex',
          user,
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
   */
  index(contextDataReader) {
    /**
     * 
     * @param {Request} req
     * @param {Response} res
     */
    async function handler(req, res, next) {
      try {
        const user = req.user;
        const reader = contextDataReader.businessCriteriaDataReader.dataReader;
        const si = await reader.readServiceIndex();
        const tmpl = nunjucks.render('welcome.html', {
          navbar: si.items,
          csrf: 'tokex',
          user
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
      contextDataReader.businessCriteriaDataReader.read.bind(contextDataReader.businessCriteriaDataReader),
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
  async bcMenuGenerator(contextDataReader, id) {
    const reader = contextDataReader.businessCriteriaDataReader.dataReader;
    const si = await reader.readServiceIndex();

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
      const user = req.user;
      const { id, ruleId } = req.params;
      const qrReader = contextDataReader.qualityRuleDataReader;

      try {
        const si = await qrReader.dataReader.readServiceIndex();
        let details;
        if (ruleId) {
          const qualityRule = await qrReader.read(ruleId);

          details = user ? qualityRule : qualityRule.toPublicOutput();
        }
        const item = await findById(id);

        if (!item) return res.sendStatus(404);

        const model = transform ? transform(item) : item;
        const tmpl = nunjucks.render('data_navigation.html', {
          model,
          navbar: si.items,
          details,
          csrf: 'tokex',
          user,
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