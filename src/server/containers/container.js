const { createIocBuilder } = require("../lib/cnjs-utils/services/ioc-container");
const types = require("./types");
const { FolderService, types: fldTypes } = require("../services/folder-service");
const { DataReader, types: drTypes } = require("../services/data-reader");
const { TechnologyDataReader } = require("../services/technology-reader");
const { QualityStandardsDataReader } = require("../services/quality-standard-reader");
const { QualityRuleDataReader, PublicQualityRuleSearchIndex, PrivateQualityRuleSearchIndex } = require("../services/quality-rule-reader");
const { ExtensionDataReader } = require("../services/extension-service");
const { Serializer } = require("../services/data-serializer");
const { IconURLBuilder } = require("../services/icon-url-builder");
const { RulesDocumentationServer } = require("../server");
const { logFactory } = require("../services/logger");
const { HttpErrorFactory } = require("../services/http-error-service");
const { ApiController, QualityRulesController, SwaggerUIController, AIPServiceController, CARLServiceController, TechnologyController,
  QualityStandardController, ExtensionController, BusinessCriteriaController, IndexController, TechnicalCriteriaController, SSOController,
  PublicController, RulesController, RenderController } = require("../controllers");
const { BusinessCriteriaDataReader } = require("../services/business-criteria-reader");
const { TechnicalCriteriaDataReader } = require("../services/technical-criteria-reader");
const { SSOCache, passportConfigure, ExtendAuthWebClient } = require("../services/extend-authentication-service");
const { UrlConverter } = require("../services/url-converter");
const { JsonFileReader } = require("../services/json-file-reader");
const { configurationFactory } = require("../config");
const ContextDataReader = require("../services/context-data-reader/reader");

const iocBuilder = createIocBuilder();

iocBuilder
  // server configuration file
  .registerSingleton(types.configuration, () => configurationFactory())
  // folder service
  .register(types.folderService, FolderService, [types.configuration])

  // server version
  .registerConstant(types.serverVersion, "2.0.0")

  // logger
  .registerSingleton(types.logger, (context) => {
    /**@type {import("../services/folder-service/folder-service")} */
    const fldService = context.container.get(types.folderService);

    return logFactory(fldService);
  })

  // http error factory
  .registerConstant(types.httpErrorFactory, HttpErrorFactory)

  // iconUrl builder
  .registerFactory(types.iconUrlBuilder, (context) => {
    const cntr = context.container;
    const config = cntr.get(types.configuration);

    return new IconURLBuilder(config.pngIconRepo, "png");
  })
  .registerFactory(types.iconUrlBuilderLocal, (context) => {
    const cntr = context.container;
    const config = cntr.get(types.configuration);

    return new IconURLBuilder(config.svgIconRepo, "svg");
  })

  // sso cache
  .registerSingleton(types.ssoCache, () => new SSOCache())

  // extend web client
  .registerFactory(types.extendWebClient, (context) => {
    const cntr = context.container;
    const config = cntr.get(types.configuration);

    return new ExtendAuthWebClient(config.extendUrl);
  })

  // public client distribution folder
  .registerFactory(types.distFolder, (context) => {
    const cntr = context.container;
    const folderService = cntr.get(types.folderService);

    return folderService.get(fldTypes.dist);
  })

  // public asset distribution folder
  .registerFactory(types.assetFolder, (context) => {
    const cntr = context.container;
    const folderService = cntr.get(types.folderService);

    return folderService.get(fldTypes.staticRes);
  })

  // passport configure
  .registerFactory(types.passportConfigure, (context) => {
    const cntr = context.container;
    const config = cntr.get(types.configuration);
    const webClient = cntr.get(types.extendWebClient);
    const ssoCache = cntr.get(types.ssoCache);

    return () => passportConfigure(webClient, config.sessionKey, ssoCache);
  })

  // url conveter from v1 implementation
  .registerFactory(types.urlConverter, (context) => {
    const cntr = context.container;
    /**@type {import("../config/configuration").Configuration} */
    const config = cntr.get(types.configuration);
    const qualityStandardReader = cntr.get(types.aipQualityStandardReaderService);
    const businessCriteriaReader = cntr.get(types.aipBusinessCriteriaDataReader);

    return new UrlConverter(config.publicUrl, config.extendUrl, businessCriteriaReader, qualityStandardReader);
  })

  // Data Readers
  .registerFactory(types.restDataReader, (context) => {
    const cntr = context.container;
    const folderService = cntr.get(types.folderService);
    const serializer = cntr.get(types.serializer);
    const staticReader = cntr.get(types.staticFolderReader);

    const dataReader = new DataReader(folderService.get(fldTypes.restIndex), "/api", serializer, staticReader);

    return dataReader;
  })
  .registerFactory(types.aipDataReader, (context) => {
    const cntr = context.container;
    const folderService = cntr.get(types.folderService);
    const serializer = cntr.get(types.serializer);
    const staticReader = cntr.get(types.staticFolderReader);

    return new DataReader(folderService.get(fldTypes.restAip), drTypes.aip, serializer, staticReader);
  })
  .registerFactory(types.carlDataReader, (context) => {
    const cntr = context.container;
    const folderService = cntr.get(types.folderService);
    const serializer = cntr.get(types.serializer);
    const staticReader = cntr.get(types.staticFolderReader);

    return new DataReader(folderService.get(fldTypes.restCarl), drTypes.carl, serializer, staticReader);
  })
  .registerFactory(types.aipTechnologyDataReader, (context) => {
    const cntr = context.container;
    const folderService = cntr.get(types.folderService);

    return new TechnologyDataReader(folderService.get(fldTypes.mapping), cntr.get(types.aipDataReader), cntr.get(types.iconUrlBuilder));
  })
  .registerFactory(types.carlTechnologyDataReader, (context) => {
    const cntr = context.container;
    const folderService = cntr.get(types.folderService);

    return new TechnologyDataReader(folderService.get(fldTypes.mapping), cntr.get(types.carlDataReader), cntr.get(types.iconUrlBuilder));
  })
  .registerFactory(types.aipQualityStandardReaderService, (context) => {
    const cntr = context.container;
    const dataReader = cntr.get(types.aipDataReader);
    const serializer = cntr.get(types.serializer);

    return new QualityStandardsDataReader(dataReader, serializer);
  })
  .registerFactory(types.carlQualityStandardReaderService, (context) => {
    const cntr = context.container;
    const dataReader = cntr.get(types.carlDataReader);
    const serializer = cntr.get(types.serializer);

    return new QualityStandardsDataReader(dataReader, serializer);
  })
  .registerFactory(types.qualityRuleDataReader, (context) => {
    const cntr = context.container;
    const dataReader = cntr.get(types.aipDataReader);
    const serializer = cntr.get(types.serializer);

    return new QualityRuleDataReader(dataReader, serializer);
  })
  .registerFactory(types.extensionDataReader, (context) => {
    const cntr = context.container;
    const dataReader = cntr.get(types.aipDataReader);
    const serializer = cntr.get(types.serializer);

    return new ExtensionDataReader(dataReader, serializer);
  })
  .registerFactory(types.aipBusinessCriteriaDataReader, (context) => {
    const cntr = context.container;
    const dataReader = cntr.get(types.aipDataReader);
    const serializer = cntr.get(types.serializer);

    return new BusinessCriteriaDataReader(dataReader, serializer);
  })
  .registerFactory(types.carlBusinessCriteriaDataReader, (context) => {
    const cntr = context.container;
    const dataReader = cntr.get(types.carlDataReader);
    const serializer = cntr.get(types.serializer);

    return new BusinessCriteriaDataReader(dataReader, serializer);
  })
  .registerFactory(types.aipTechnicalCriteriaDataReader, (context) => {
    const cntr = context.container;
    const dataReader = cntr.get(types.aipDataReader);
    const serializer = cntr.get(types.serializer);

    return new TechnicalCriteriaDataReader(dataReader, serializer);
  })
  .registerFactory(types.carlTechnicalCriteriaDataReader, (context) => {
    const cntr = context.container;
    const dataReader = cntr.get(types.carlDataReader);
    const serializer = cntr.get(types.serializer);

    return new TechnicalCriteriaDataReader(dataReader, serializer);
  })
  .registerFactory(types.staticFolderReader, (context) => {
    const cntr = context.container;
    const folderService = cntr.get(types.folderService);

    return new JsonFileReader(folderService.get(fldTypes.mapping));
  })
  .registerFactory(types.aipContextReader, (context) => {
    const cntr = context.container;

    return new ContextDataReader(
      "aip",
      cntr.get(types.aipTechnologyDataReader),
      cntr.get(types.aipQualityStandardReaderService),
      cntr.get(types.qualityRuleDataReader),
      cntr.get(types.extensionDataReader),
      cntr.get(types.aipBusinessCriteriaDataReader),
      cntr.get(types.aipTechnicalCriteriaDataReader),
    );
  })
  .registerFactory(types.carlContextReader, (context) => {
    const cntr = context.container;

    return new ContextDataReader(
      "carl",
      cntr.get(types.carlTechnologyDataReader),
      cntr.get(types.carlQualityStandardReaderService),
      cntr.get(types.qualityRuleDataReader),
      cntr.get(types.extensionDataReader),
      cntr.get(types.carlBusinessCriteriaDataReader),
      cntr.get(types.carlTechnicalCriteriaDataReader),
    );
  })

  // serializers
  .register(types.serializer, Serializer, [types.iconUrlBuilderLocal])

  // service indexes

  // static controllers
  .registerFactory(types.controllers.swaggerui, (context) => {
    const cntr = context.container;
    const folderService = cntr.get(types.folderService);
    const logger = cntr.get(types.logger);

    return new SwaggerUIController(logger, folderService.get(fldTypes.doc));
  })

  // Quality Rule Search Index
  .registerSingleton(types.searchIndex.public, (context) => {
    const cntr = context.container;
    const fldService = cntr.get(types.folderService);
    const qualityRuleReader = cntr.get(types.qualityRuleDataReader);

    return new PublicQualityRuleSearchIndex(fldService, qualityRuleReader);
  })
  .registerSingleton(types.searchIndex.private, (context) => {
    const cntr = context.container;
    const fldService = cntr.get(types.folderService);
    const qualityRuleReader = cntr.get(types.qualityRuleDataReader);

    return new PrivateQualityRuleSearchIndex(fldService, qualityRuleReader);
  })

  // controllers
  .registerFactory(types.controllers.aip.technology, (context) => {
    const cntr = context.container;
    return new TechnologyController(cntr.get(types.logger), cntr.get(types.aipTechnologyDataReader), cntr.get(types.configuration));
  })
  .registerFactory(types.controllers.carl.technology, (context) => {
    const cntr = context.container;
    return new TechnologyController(cntr.get(types.logger), cntr.get(types.carlTechnologyDataReader), cntr.get(types.configuration));
  })
  .registerFactory(types.controllers.aip.qualityStandard, (context) => {
    const cntr = context.container;
    return new QualityStandardController(cntr.get(types.logger), cntr.get(types.aipQualityStandardReaderService), cntr.get(types.configuration));
  })
  .registerFactory(types.controllers.carl.qualityStandard, (context) => {
    const cntr = context.container;
    return new QualityStandardController(cntr.get(types.logger), cntr.get(types.carlQualityStandardReaderService), cntr.get(types.configuration));
  })
  .registerFactory(types.controllers.aip.extension, (context) => {
    const cntr = context.container;
    return new ExtensionController(cntr.get(types.logger), cntr.get(types.extensionDataReader), cntr.get(types.configuration));
  })
  .registerFactory(types.controllers.aip.businessCriteria, (context) => {
    const cntr = context.container;
    return new BusinessCriteriaController(cntr.get(types.logger), cntr.get(types.aipBusinessCriteriaDataReader), cntr.get(types.configuration));
  })
  .registerFactory(types.controllers.carl.businessCriteria, (context) => {
    const cntr = context.container;
    return new BusinessCriteriaController(cntr.get(types.logger), cntr.get(types.carlBusinessCriteriaDataReader), cntr.get(types.configuration));
  })
  .registerFactory(types.controllers.aip.index, (context) => {
    const cntr = context.container;
    return new IndexController(cntr.get(types.logger), cntr.get(types.aipBusinessCriteriaDataReader), cntr.get(types.configuration));
  })
  .registerFactory(types.controllers.carl.index, (context) => {
    const cntr = context.container;
    return new IndexController(cntr.get(types.logger), cntr.get(types.carlBusinessCriteriaDataReader), cntr.get(types.configuration));
  })
  .registerFactory(types.controllers.aip.technicalCriteria, (context) => {
    const cntr = context.container;
    return new TechnicalCriteriaController(cntr.get(types.logger), cntr.get(types.aipTechnicalCriteriaDataReader), cntr.get(types.configuration));
  })
  .registerFactory(types.controllers.rules, (context) => {
    const cntr = context.container;
    return new RulesController(cntr.get(types.logger), cntr.get(types.urlConverter), cntr.get(types.configuration));
  })
  .registerFactory(types.controllers.render, (context) => {
    const cntr = context.container;
    return new RenderController(
      cntr.get(types.aipContextReader),
      cntr.get(types.logger),
      cntr.get(types.configuration)
    );
  })
  .registerFactory(types.controllers.publicAssets, (context) => {
    const cntr = context.container;
    return new PublicController('/resources',
      /(\/api)|(\/rules)/i,
      false,
      cntr.get(types.logger),
      cntr.get(types.assetFolder),
      cntr.get(types.configuration))
  })
  .register(types.controllers.sso, SSOController, [types.logger, types.configuration, types.ssoCache])
  .register(types.controllers.carlServiceIndex, CARLServiceController, [types.logger, types.carlDataReader,
  types.controllers.carl.technology, types.controllers.carl.qualityStandard, types.controllers.carl.businessCriteria,
  types.controllers.carl.index])
  .register(types.controllers.aipServiceIndex, AIPServiceController, [types.logger, types.aipDataReader,
  types.controllers.aip.technology, types.controllers.aip.qualityStandard, types.controllers.aip.extension,
  types.controllers.aip.businessCriteria, types.controllers.aip.index, types.controllers.aip.technicalCriteria])
  .register(types.controllers.qualityRules, QualityRulesController, [types.logger, types.qualityRuleDataReader,
  types.searchIndex.public, types.searchIndex.private, types.configuration])
  .register(types.controllers.api, ApiController, [types.logger, types.restDataReader, types.controllers.swaggerui,
  types.controllers.aipServiceIndex, types.controllers.carlServiceIndex, types.controllers.qualityRules,
  types.controllers.sso])

  .register(types.server, RulesDocumentationServer, [types.logger, types.serverVersion, types.configuration,
  types.httpErrorFactory, types.passportConfigure, types.folderService, types.controllers.api, types.controllers.rules, types.controllers.render, types.controllers.publicAssets]);

module.exports = iocBuilder.getContainer();