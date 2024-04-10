const { Controller } = require("../lib/cnjs-utils/server");
const nunjucks = require("nunjucks");
const { parseQuery } = require("../services/quality-rule-reader/lib");
const { stream } = require("../lib/stream");

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
    this.get(base, handler(this.contextDataReader));
    this.get(`${base}/details/:ruleId`, handler(this.contextDataReader));
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
        const items = si.items.slice();

        let details;
        if (ruleId) {
          const qualityRule = await qrReader.read(ruleId);

          details = user ? qualityRule : qualityRule.toPublicOutput();
        }
        const item = await contextDataReader.extensionDataReader.readVersion(id, version);

        if (!item) return res.sendStatus(404);
        const nav = si.getItem('extensions');
        const ext = await contextDataReader.extensionDataReader.read(id);
        const extItems = stream(ext.items)
          .map(_ => ({ ..._, isLeaf: true }))
          .collect()

        nav.items = stream(await contextDataReader.extensionDataReader.list())
          .filter(_ => _.hasRules)
          .map(_ => {
            const sattrs = { ignoreTitleTransform: true, isLeaf: false };
            return _.name === ext.name ? { ...ext, ...sattrs, items: extItems } : { ..._, ...sattrs };
          })
          .collect()

        for (let index = 0; index < items.length; index++) {
          const idxItem = items[index];
          if (idxItem.name === nav.name) {
            items[index] = nav;
            break;
          }
        }

        const model = transform ? transform(item) : item;
        const tmpl = nunjucks.render('data_navigation.html', {
          model,
          navbar: items,
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
  qualityStandardsHandler(contextDataReader) {
    /**
     * 
     * @param {Request} req
     * @param {Response} res
     */
    async function handler(req, res, next) {
      const { standard, category, itemId, ruleId } = req.params;
      const user = req.user;
      const reader = contextDataReader.qualityStandardDataReader;
      const qrReader = contextDataReader.qualityRuleDataReader;

      try {
        const si = await reader.dataReader.readServiceIndex();
        const items = si.items.slice();

        let details;
        if (ruleId) {
          const qualityRule = await qrReader.read(ruleId);

          details = user ? qualityRule : qualityRule.toPublicOutput();
        }
        const item = await reader.readQualityStandardItems(standard, category, itemId);

        if (!item) return res.sendStatus(404);
        const nav = si.getItem('quality standards');
        const [cat, std, nitems] = await Promise.all([
          reader.readQualityStandardCategory(standard, category),
          reader.read(standard),
          reader.list(),
        ]);
        const catItems = stream(cat.items).map(_ => ({ ..._, isLeaf: true })).collect();
        const stdItems = stream(std.items)
          .map(_ => _.name === cat.name
            ? { ...cat, isLeaf: false, items: catItems }
            : { ..._, isLeaf: false })
          .collect();
        nav.items = stream(nitems)
          .map(_ => _.name === std.name
            ? { ...std, isLeaf: false, items: stdItems }
            : { ..._, isLeaf: false })
          .collect();

        for (let index = 0; index < items.length; index++) {
          const idxItem = items[index];
          if (idxItem.name === nav.name) {
            items[index] = nav;
            break;
          }
        }

        const tmpl = nunjucks.render('data_navigation.html', {
          model: item,
          navbar: items,
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
   */
  businessCriteriaList(contextDataReader) {
    /**
     * 
     * @param {Request} req
     * @param {Response} res
     */
    async function handler(req, res, next) {
      const user = req.user;
      const { id, ruleId } = req.params;
      const reader = contextDataReader.businessCriteriaDataReader;
      const qrReader = contextDataReader.qualityRuleDataReader;
      const isIndex = parseInt(id) > 1000000;

      try {
        const si = await reader.dataReader.readServiceIndex();
        const items = si.items.slice();

        let details;
        if (ruleId) {
          const qualityRule = await qrReader.read(ruleId);

          details = user ? qualityRule : qualityRule.toPublicOutput();
        }
        const item = await reader.read(id);

        if (!item) return res.sendStatus(404);
        const nav = si.getItem(isIndex ? "indexes" : "business criteria");
        nav.items = stream(await reader.list())
          .filter(_ => isIndex ? (_.id > 1000000) : (_.id < 1000000))
          .map(_ => ({ ..._, isLeaf: true }))
          .collect()

        for (let index = 0; index < items.length; index++) {
          const idxItem = items[index];
          if (idxItem.name === nav.name) {
            items[index] = nav;
            break;
          }
        }

        const tmpl = nunjucks.render('data_navigation.html', {
          model: item,
          navbar: items,
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
  technologiesList(contextDataReader) {
    /**
     * 
     * @param {Request} req
     * @param {Response} res
     */
    async function handler(req, res, next) {
      const user = req.user;
      const { id, ruleId } = req.params;
      const reader = contextDataReader.technologyDataReader;
      const qrReader = contextDataReader.qualityRuleDataReader;

      try {
        const si = await reader.dataReader.readServiceIndex();
        const items = si.items.slice();

        let details;
        if (ruleId) {
          const qualityRule = await qrReader.read(ruleId);

          details = user ? qualityRule : qualityRule.toPublicOutput();
        }
        const item = await reader.readTechnology(id);

        if (!item) return res.sendStatus(404);
        const nav = si.getItem('technologies');
        nav.items = stream(await reader.readConsolidatedTechnologies())
          .map(_ => ({ ..._, isLeaf: true }))
          .sort((a, b) => a.name.localeCompare(b.name))
          .collect();

        for (let index = 0; index < items.length; index++) {
          const idxItem = items[index];
          if (idxItem.name === nav.name) {
            items[index] = nav;
            break;
          }
        }

        const tmpl = nunjucks.render('data_navigation.html', {
          model: item.toApiOutput(),
          navbar: items,
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