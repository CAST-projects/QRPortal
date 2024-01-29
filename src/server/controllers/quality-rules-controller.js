const { Controller } = require("../lib/cnjs-utils/server");
const nunjucks = require("nunjucks");
const { parseQuery } = require("../services/quality-rule-reader/lib");

/**
 * @typedef {import("winston").Logger} Logger
 * @typedef {import("../services/quality-rule-reader/service")} DataReader
 * @typedef {import("../services/http-error-service/service")} HttpErrorFactory
 * @typedef {import("../services/quality-rule-reader/search-service")} QualityRuleSearchIndex
 * @typedef {import("../config/configuration").Configuration} Configuration
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

class QualityRulesController extends Controller {

  /**
   * @param {Logger} logger 
   * @param {DataReader} dataReader 
   * @param {QualityRuleSearchIndex} publicSearchIndex
   * @param {QualityRuleSearchIndex} privateSearchIndex
   * @param {Configuration} configuration
   */
  constructor(logger, dataReader, publicSearchIndex, privateSearchIndex, configuration) {
    super({ logger, baseUrl: "/quality-rules" });

    this.dataReader = dataReader;
    this.publicSearchIndex = publicSearchIndex;
    this.privateSearchIndex = privateSearchIndex;
    this.configuration = configuration;
  }

  async $preprocess() {
    this.log.info(`Initiating ${this.publicSearchIndex.constructor.name}`);
    await this.publicSearchIndex.generate();
    this.log.info(`Initiating ${this.privateSearchIndex.constructor.name}`);
    await this.privateSearchIndex.generate();
    this
      .get("/:id",
        this.handleAuthorizationRedirect(
          this.getQualityRule(this.dataReader, this.configuration),
          this.getPublicQualityRule(this.dataReader, this.configuration)
        )
      )
      .get("/", this.searchQueryBuilderMiddleware(this.publicSearchIndex, this.privateSearchIndex),
        this.handleAuthorizationRedirect(
          this.searchQualityRules(this.dataReader, this.privateSearchIndex, this.configuration),
          this.searchQualityRules(this.dataReader, this.publicSearchIndex, this.configuration)
        ));
  }

  $postprocess() {
    this.log.info(`${this.constructor.name} Initialized`);
  }

  handleAuthorizationRedirect(onSuccess, onFail) {
    return (req, res, next) => {
      if (req.user) {
        onSuccess(req, res, next);
      }
      else onFail(req, res, next)
    };
  }

  /**
 * @param {TechnologyService} technologyService 
 * @param {Logger} logger 
 */
  searchQueryBuilderMiddleware(publicSI, privateSI) {

    /**
     * @param {Request} req 
     * @param {Response} res
     * @param {NextFunction} next
     */
    async function handler(req, _res, next) {
      const { q: query, "search-by": searchBy } = req.query;
      let _query = [];
      let _searchBy;

      try {

        if (searchBy) {
          if (!!req.user) {
            _searchBy = privateSI.getSearchBy(searchBy);
          } else {
            _searchBy = publicSI.getSearchBy(searchBy);
          }
        }

        if (query) {
          _query = parseQuery(query);
        }

        req.searchParams = {
          query: _query,
          searchBy: _searchBy,
        };

        next();
      } catch (error) {
        next(error);
      }
    }

    return handler;
  }

  /**
   * @param {DataReader} dataReader 
   * @param {QualityRuleSearchIndex} searchIndex 
   * @param {Configuration} config
   */
  searchQualityRules(dataReader, searchIndex, config) {

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    async function handler(req, res, next) {
      const { query, searchBy } = req.searchParams;

      try {
        let results = searchIndex.search(query, searchBy);
        if (results.length === 0) results = searchIndex.looseSearch(query, searchBy);
        const ids = results.map(_ => _.ref);
        const qualityRules = await dataReader.listQualityRuleReferences(ids);
        const model = { name: "quality rules search", href: "/quality-rules", qualityRules };

        if (!req.headers['hx-request']) {
          res.status(200).json(model);
        } else {
          res.setHeader('HX-Replace-Url', (config.contextPath ? config.contextPath : '') + `search/${query}${searchBy ? `?by=${searchBy}` : ''}`);
          res.send(nunjucks.render('_search-results.html', { model, query, searchBy }));
        }
      } catch (error) {
        next(error);
      }
    }

    return handler

  }

  /**
   * @param {Logger} logger 
   * @param {DataReader} dataReader 
   * @param {Configuration} config
   */
  getQualityRule(dataReader, config) {

    /**
     * @param {Request} req 
     * @param {Response} res 
     */
    async function handler(req, res, next) {
      const { id } = req.params;
      let { filter } = req.query;

      try {
        const qualityRule = await dataReader.read(id);

        if (filter) {
          if (typeof filter === "string") filter = [filter];

          if (filter.some(_ => _.toLowerCase() === "technical-criteria!=cast")) {
            qualityRule.technicalCriteria = qualityRule.technicalCriteria.filter(_ => _.id < 1_000_000);
          } else if (filter.some(_ => _.toLowerCase() === "technical-criteria=cast")) {
            qualityRule.technicalCriteria = qualityRule.technicalCriteria.filter(_ => _.id > 1_000_000);
          }
        }

        if (!req.headers['hx-request']) {
          res.status(200).json(qualityRule);
        } else {
          let cUrl = req.headers['hx-current-url'];
          let currentUrl = cUrl.split(config.publicUrl)[1];
          let qs = '';
          if (currentUrl.includes("?")) {
            const _qs = currentUrl.split("?");
            qs = '?' + _qs[1];
            currentUrl = _qs[0];
          }
          currentUrl = currentUrl.split('/details/')[0];
          res.setHeader('HX-Replace-Url', currentUrl + `/details/${id}${qs}`);

          res.send(nunjucks.render('_details.html', { details: qualityRule }));
        }
      } catch (error) {
        next(error);
      }
    }

    return handler
  }

  /**
   * @param {Logger} logger 
   * @param {DataReader} dataReader 
   * @param {Configuration} config
   */
  getPublicQualityRule(dataReader, config) {

    /**
     * @param {Request} req 
     * @param {Response} res 
     */
    async function handler(req, res, next) {
      const { id } = req.params;
      let { filter } = req.query;

      try {
        const qualityRule = await dataReader.read(id);

        if (!req.headers['hx-request']) {
          res.status(206).json(qualityRule.toPublicOutput());
        } else {
          let cUrl = req.headers['hx-current-url'];
          let currentUrl = cUrl.split(config.publicUrl)[1];
          let qs = '';
          if (currentUrl.includes("?")) {
            const _qs = currentUrl.split("?");
            qs = '?' + _qs[1];
            currentUrl = _qs[0];
          }
          currentUrl = currentUrl.split('/details/')[0];
          res.setHeader('HX-Replace-Url', currentUrl + `/details/${id}${qs}`);
          if (filter) res.setHeader('HX-Refresh', 'true');
          res.send(nunjucks.render('_details.html', { details: qualityRule.toPublicOutput() }));
        }
      } catch (error) {
        next(error);
      }
    }

    return handler
  }
}

module.exports = QualityRulesController;