const { Controller } = require("../lib/cnjs-utils/server");

/**
 * @typedef {import("winston").Logger} Logger
 * @typedef {import("../services/extension-service/service")} ExtensionDataReader
 * @typedef {import("../services/http-error-service/service")} HttpErrorFactory
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

class ExtensionController extends Controller {

  /**
   * @param {Logger} logger 
   * @param {ExtensionDataReader} dataReader 
   */
  constructor(logger, dataReader){
    super({ logger, baseUrl: "/extensions" });

    this.dataReader = dataReader;
  }

  async $preprocess(){
    await this.dataReader.initMapping();

    this
      .get("/", this.listExtensions(this.dataReader))
      .get("/:id", this.getExtension(this.dataReader))
      .get("/:id/versions/:version", this.getExtensionVersion(this.dataReader));
  }

  $postprocess(){
    this.log.info(`${this.constructor.name} Initialized`);
  }

  /**
   * @param {ExtensionDataReader} dataReader 
   */
   listExtensions(dataReader){

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    async function handler(_req, res, next){
      try {
        const list = await dataReader.list();
        
        res.status(200).json(list);
      } catch (error) {
        next(error);
      }
    }

    return handler
  }

  /**
   * @param {ExtensionDataReader} dataReader 
   */
  getExtension(dataReader){

    /**
     * @param {Request} req 
     * @param {Response} res 
     */
    async function handler(req, res, next){
      const {id} = req.params;

      try {
        const model = await dataReader.read(id);

        res.status(200).json(model);
      } catch (error) {
        next(error);
      }
    }

    return handler
  }

    /**
   * @param {ExtensionDataReader} dataReader 
   */
  getExtensionVersion(dataReader){

    /**
     * @param {Request} req 
     * @param {Response} res 
     */
    async function handler(req, res, next){
      const {id, version} = req.params;

      try {
        const model = await dataReader.readVersion(id, version);

        res.status(200).json(model);
      } catch (error) {
        next(error);
      }
    }

    return handler
  }
}

module.exports = ExtensionController;