const QualityRuleSearchIndex = require("./search-service");

const fields = ["id", "name", "rationale", "businessCriteria", "technicalCriteria", "technologies", "qualityStandards"];

/**
 * @param {import("../data-serializer/models/quality-rule")} qualityRule 
 */
function factory(qualityRule) {
  return {
    ref: qualityRule.id,
    id: qualityRule.id,
    name: qualityRule.name,
    rationale: qualityRule.rationale,
    businessCriteria: qualityRule.businessCriteria.map(_ => _.name),
    technicalCriteria: qualityRule.technicalCriteria.map(_ => _.id),
    technologies: qualityRule.technologies.map(_ => `${_.id} ${_.name}`),
    qualityStandards: qualityRule.qualityStandards.map(_ => `${_.id} ${_.standard}`)
  }
}

class PublicQualityRuleSearchIndex extends QualityRuleSearchIndex {
  constructor(folderService, qualityRuleReader) {
    super(folderService, qualityRuleReader, "public-quality-rule-search-index", fields, factory);
  }

  /**
   * @param {string} field 
   */
  getSearchBy(field = "") {
    switch (field.toLowerCase()) {
      case "id":
        return "id";
      case "name":
        return "name";
      case "rationale":
        return "rationale";
      case "technologies":
        return "technologies";
      default:
        return undefined;
    }
  }
}

module.exports = PublicQualityRuleSearchIndex;