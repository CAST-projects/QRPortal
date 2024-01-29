const QualityRuleSearchIndex = require("./search-service");

const fields = ["id", "name", "critical", "maxWeight", "associatedValueName", "description", "output", "rationale", "remediation", "sample", "total", "alternativeName", "businessCriteria", "technicalCriteria", "technologies", "qualityStandards"];

/**
 * @param {import("../data-serializer/models/quality-rule")} qualityRule 
 */
function factory(qualityRule) {
  return {
    ref: qualityRule.id,
    id: qualityRule.id,
    name: qualityRule.name,
    description: qualityRule.description,
    remediation: qualityRule.remediation,
    sample: qualityRule.sample,
    rationale: qualityRule.rationale,
    businessCriteria: qualityRule.businessCriteria.map(_ => _.name),
    technicalCriteria: qualityRule.technicalCriteria.map(_ => _.id),
    technologies: qualityRule.technologies.map(_ => _.name),
    qualityStandards: qualityRule.qualityStandards.map(_ => `${_.id} ${_.standard}`)
  }
}

class PrivateQualityRuleSearchIndex extends QualityRuleSearchIndex {
  constructor(folderService, qualityRuleReader) {
    super(folderService, qualityRuleReader, "private-quality-rule-search-index", fields, factory);
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
      case "severity":
        return "severity";
      case "critical":
        return "critical";
      case "max-weight":
        return "maxWeight";
      case "associated-value-name":
        return "associatedValueName";
      case "output":
        return "output";
      case "remediation":
        return "remediation";
      case "sample":
        return "sample";
      case "total":
        return "total";
      case "alternative-name":
        return "alternativeName";
      case "technical-criteria":
        return "technicalCriteria";
      case "business-criteria":
        return "businessCriteria";
      case "quality-standards":
        return "qualityStandards";
      default:
        return;
    }
  }
}

module.exports = PrivateQualityRuleSearchIndex;