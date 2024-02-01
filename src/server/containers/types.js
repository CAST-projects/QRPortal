module.exports = {
  server: "server",
  serverVersion: "serverVersion",
  serverPort: "serverPort",

  configuration: "configuration",

  sessionKey: "sessionKey",
  extendUrl: "extendUrl",
  publicUrl: "publicUrl",

  ssoCache: "ssoCache",

  distFolder: "distFolder",
  assetFolder: "assetFolder",

  passportConfigure: "passportConfigure",
  extendWebClient: "extendWebClient",

  logger: "logger",

  folderService: "folderService",
  storageService: "storageService",
  jsonFileReader: "jsonFileReader",

  staticFolderReader: "staticFolderReader",

  aipDataReader: "aipDataReader",
  carlDataReader: "carlDataReader",
  restDataReader: "restDataReader",
  aipContextReader: "aipContextReader",
  carlContextReader: "carlContextReader",

  qualityRuleDataReader: "qualityRuleDataReader",
  extensionDataReader: "extensionDataReader",

  aipBusinessCriteriaDataReader: "aipBusinessCriteriaDataReader",
  carlBusinessCriteriaDataReader: "carlBusinessCriteriaDataReader",

  aipTechnicalCriteriaDataReader: "aipTechnicalCriteriaDataReader",
  carlTechnicalCriteriaDataReader: "carlTechnicalCriteriaDataReader",

  aipTechnologyDataReader: "aipTechnologyDataReader",
  carlTechnologyDataReader: "carlTechnologyDataReader",

  aipQualityStandardReaderService: "aipQualityStandardReaderService",
  carlQualityStandardReaderService: "carlQualityStandardReaderService",

  iconUrlBuilder: "iconUrlBuilder",
  iconUrlBuilderLocal: "iconUrlBuilderLocal",

  httpErrorFactory: "httpErrorFactory",

  urlConverter: "UrlConverter",

  serviceIndex: {
    aip: "aipServiceIndex",
    carl: "carlServiceIndex",
  },

  searchIndex: {
    public: "publicQualityRuleSearchIndex",
    private: "privateQualityRuleSearchIndex",
  },

  serializer: "Serializer",

  controllers: {
    api: "apiController",
    qualityRules: "QualityRulesController",
    swaggerui: "SwaggerUIController",
    staticRest: "StaticRestController",
    restUi: "StaticRestUIController",
    aipServiceIndex: "AIPServiceController",
    carlServiceIndex: "CARLServiceController",
    sso: "ssoController",
    public: "PublicController",
    publicAssets: "PublicAssetsController",
    rules: "RulesController",
    render: "RenderController",
    aip: {
      extension: "AIPExtensionController",
      technology: "AIPTechnologyController",
      qualityStandard: "AIPQualityStandardController",
      businessCriteria: "AIPBusinessCriteriaController",
      technicalCriteria: "AIPTechnicalCriteriaController",
      index: "AIPIndexController",
    },
    carl: {
      technology: "CARLTechnologyController",
      qualityStandard: "CARLQualityStandardController",
      businessCriteria: "CARLBusinessCriteriaController",
      technicalCriteria: "CARLTechnicalCriteriaController",
      index: "CARLIndexController",
    }
  },
};