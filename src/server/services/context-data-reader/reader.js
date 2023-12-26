/**
 * @typedef {'aip'|'carl'} Context
 */

class ContextDataReader {

  /**
   * @param {'aip'|'carl'} name
   * @param {import("../technology-reader/service")} technologyDataReader
   * @param {import("../quality-standard-reader/service")} qualityStandardDataReader
   * @param {import("../quality-rule-reader/service")} qualityRuleDataReader
   * @param {import("../extension-service/service")} extensionDataReader
   * @param {import("../business-criteria-reader/reader")} businessCriteriaDataReader
   * @param {import("../technical-criteria-reader/reader")} technicalCriteriaDataReader
   */
  constructor(context, technologyDataReader, qualityStandardDataReader,
    qualityRuleDataReader, extensionDataReader, businessCriteriaDataReader, technicalCriteriaDataReader) {
    this.context = context;
    this.technologyDataReader = technologyDataReader;
    this.qualityStandardDataReader = qualityStandardDataReader;
    this.qualityRuleDataReader = qualityRuleDataReader;
    this.extensionDataReader = extensionDataReader;
    this.businessCriteriaDataReader = businessCriteriaDataReader;
    this.technicalCriteriaDataReader = technicalCriteriaDataReader;
  }
}

module.exports = ContextDataReader;