const { Controller } = require("../lib/cnjs-utils/server");
const { jwtAuth } = require("../services/extend-authentication-service");

/**
 * @typedef {import("winston").Logger} Logger
 * @typedef {import("../services/quality-rule-reader/service")} DataReader
 * @typedef {import("../services/http-error-service/service")} HttpErrorFactory
 * @typedef {import("../services/quality-rule-reader/search-service")} QualityRuleSearchIndex
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
   */
  constructor(logger, dataReader, publicSearchIndex, privateSearchIndex){
    super({ logger, baseUrl: "/quality-rules" });

    this.dataReader = dataReader;
    this.publicSearchIndex = publicSearchIndex;
    this.privateSearchIndex = privateSearchIndex;
  }

  async $preprocess(){
    this.log.info(`Initiating ${this.publicSearchIndex.constructor.name}`);
    await this.publicSearchIndex.generate();
    this.log.info(`Initiating ${this.privateSearchIndex.constructor.name}`);
    await this.privateSearchIndex.generate();
    this
      .get("/:id", 
        jwtAuth(),
        this.handleAuthorizationRedirect(
          this.getQualityRule(this.dataReader),
          this.getPublicQualityRule(this.dataReader)
        )
      )
      .get("/", jwtAuth(), this.searchQueryBuilderMiddleware(), this.handleAuthorizationRedirect(
        this.searchQualityRules(this.dataReader, this.privateSearchIndex),
        this.searchQualityRules(this.dataReader, this.publicSearchIndex)
      ));
  }

  $postprocess(){
    this.log.info(`${this.constructor.name} Initialized`);
  }

  handleAuthorizationRedirect(onSuccess, onFail){
    return (req, res, next) => {
      if(req.user) {
        onSuccess(req, res, next);
      }
      else onFail(req, res, next)
    };
  }

    /**
   * @param {TechnologyService} technologyService 
   * @param {Logger} logger 
   */
  searchQueryBuilderMiddleware(){

    /**
     * @param {Request} req 
     * @param {Response} res
     * @param {NextFunction} next
     */
     async function handler(req, _res, next){
      const { q: query, "search-by": searchBy } = req.query;
      const _query = [];
      let _searchBy;

      try {

        if(searchBy){
          switch (searchBy.toLowerCase()) {
            case "id":
              _searchBy = "id";
              break
            case "name":
              _searchBy = "name";
              break;
            case "rationale":
              _searchBy = "rationale";
              break;
            case "technologies":
              _searchBy = "technologies";
              break;
            default:
              _searchBy = undefined;
              break;
          }

          if(!!req.user){
            switch (searchBy.toLowerCase()) {
              case "severity":
                _searchBy = "severity";
                break
              case "critical":
                _searchBy = "critical";
                break;
              case "max-weight":
                _searchBy = "maxWeight";
                break;
              case "associated-value-name":
                _searchBy = "associatedValueName";
                break;
              case "output":
                _searchBy = "output";
                break;
              case "remediation":
                _searchBy = "remediation";
                break;
              case "sample":
                _searchBy = "sample";
                break;
              case "total":
                _searchBy = "total";
                break;
              case "alternative-name":
                _searchBy = "alternativeName";
                break;
              case "technical-criteria":
                _searchBy = "technicalCriteria";
                break;
              case "business-criteria":
                _searchBy = "businessCriteria";
                break;
              case "quality-standards":
                _searchBy = "qualityStandards";
                break;
              default:
                break;
            }
          }
        }

        if(query){
          if(Array.isArray(query)){
            for (const term of query) {
              const splitTerms = term.split(" ");

              if(query.length > 1){
                for (const splitTerm of splitTerms) {
                  if(splitTerm.length > 2){
                    _query.push(splitTerm.toLowerCase());
                  }
                }
              } else {
                _query.push(...splitTerms);
              }
            }
          } else {
            const splitTerms = query.split(" ");
            if(splitTerms.length > 1){
              for (const splitTerm of splitTerms) {
                if(splitTerm.length > 2){
                  _query.push(splitTerm.toLowerCase());
                }
              }
            } else {
              _query.push(...splitTerms);
            }
          }
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
   */
  searchQualityRules(dataReader, searchIndex){

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    async function handler(req, res, next){
      const { query, searchBy } = req.searchParams;

      try {
        let results = searchIndex.search(query, searchBy);
        if(results.length === 0) results = searchIndex.looseSearch(query, searchBy);
        const ids = results.map(_ => _.ref);
        const qualityRules = await dataReader.listQualityRuleReferences(ids);

        res.status(200).json({name: "quality rules search", href: "/quality-rules", qualityRules});
      } catch (error) {
        next(error);
      }
    }

    return handler

  }

  /**
   * @param {Logger} logger 
   * @param {DataReader} dataReader 
   */
  getQualityRule(dataReader){

    /**
     * @param {Request} req 
     * @param {Response} res 
     */
    async function handler(req, res, next){
      const { id } = req.params;
      let { filter } = req.query;
      
      try {
        const qualityRule = await dataReader.read(id);

        if(filter){
          if(typeof filter === "string") filter = [filter];

          if(filter.some(_ => _.toLowerCase() === "technical-criteria!=cast")){
            qualityRule.technicalCriteria = qualityRule.technicalCriteria.filter(_ => _.id < 1_000_000);
          } else if(filter.some(_ => _.toLowerCase() === "technical-criteria=cast")){
            qualityRule.technicalCriteria = qualityRule.technicalCriteria.filter(_ => _.id > 1_000_000);
          }
        }

        res.status(200).json(qualityRule);
      } catch (error) {
        next(error);
      }
    }

    return handler
  }

  /**
   * @param {Logger} logger 
   * @param {DataReader} dataReader 
   */
  getPublicQualityRule(dataReader){

    /**
     * @param {Request} req 
     * @param {Response} res 
     */
    async function handler(req, res, next){
      const { id } = req.params;

      try {
        const qualityRule = await dataReader.read(id);

        res.status(206).json(qualityRule.toPublicOutput());
      } catch (error) {
        next(error);
      }
    }

    return handler
  }
}

module.exports = QualityRulesController;