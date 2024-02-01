
class ExtensionVersion {
  constructor(params = {}) {
    this.name = params.name;
    this.href = params.href;
    this.metaModelCRC = params.metaModelCRC;
    this.rulesCRC = params.rulesCRC;
    this.transactionsConfigurationCRC = params.transactionsConfigurationCRC;

    this.extension = params.extension;
    this.publishedTime = params.publishedTime;
    this.qualityModel = params.qualityModel;
    this.transactionsConfiguration = params.transactionsConfiguration;
    this.qualityRules = undefined;
    this.count = params.count || (this.qualityRules ? this.qualityRules.length : 0);
  }
}

module.exports = ExtensionVersion;