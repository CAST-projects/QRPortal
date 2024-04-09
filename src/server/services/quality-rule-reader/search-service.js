const { IndexService } = require("../../lib/cnjs-utils/services/search-index");
const folderTypes = require("../folder-service/types");
const fs = require("fs");

class QualityRuleSearchIndex extends IndexService {

  /**
   * @param {import("../folder-service/service")} folderService
   * @param {import("./service")} qualityRuleReader
   */
  constructor(folderService, qualityRuleReader, name, fields, entryBuilder) {
    super();

    this.fields = fields;
    this.entryBuilder = entryBuilder;
    this.qualityRuleReader = qualityRuleReader;
    this.folderService = folderService;
    this.indexFileName = name + ".json";
    this.folderPath = this.folderService.from(folderTypes.temp, this.indexFileName);
  }

  async generate() {
    const qualityRules = await this.qualityRuleReader.readAll();
    this.generateIndex(qualityRules, this.fields, this.entryBuilder);
  }

  /**
   * @param {string} value 
   */
  getSearchBy(value = '') {

  }

  /**
   * @param {string} queryString 
   * @param {string} searchBy 
   */
  query(queryString = '', searchBy) {
    const sqs = queryString && this.sanitize(queryString);

    return this.rawQuery(sqs, searchBy);
  }

  /**
   * @param {string} queryString 
   */
  sanitize(queryString) {
    return queryString.replace(/[:*^~+-]/gi, (match, offset, str) => {
      switch (match) {
        case "-":
          return " ";
        case "+":
          if (str.charCodeAt(offset - 1) !== 32) return match;
        case "*":
        case "~":
        case "^":
        case ":":
          return `\\${match}`;
        default:
          return " ";
      }
    }).trim();
  }

  searchByQueryString(queryString, searchBy) {
    return searchBy ? `${searchBy}:${queryString}` : queryString;
  }

  /**
   * @param {string} queryString 
   * @returns {string[]}
   */
  rawQuery(queryString, searchBy) {
    const results = [];
    const uniqueResults = {};

    if (queryString) {
      results.push(...this.index.search(this.searchByQueryString(`*${queryString}*`, searchBy)));
      results.push(...this.index.search(this.searchByQueryString(`*${queryString}`, searchBy)));
      results.push(...this.index.search(this.searchByQueryString(`${queryString}*`, searchBy)));
      results.push(...this.index.search(this.searchByQueryString(queryString, searchBy)));
    }

    for (let i = 0; i < results.length; i++) {
      const res = results[i].ref;
      if (!uniqueResults[res]) uniqueResults[res] = true;
    }

    return Object.keys(uniqueResults);
  }

  /**
   * @param {import("../data-serializer/models/quality-rule")[]} qualityRules
   */
  generateIndex(qualityRules = [], fields = [], entryBuilder) {
    const customTrimmer = this.customTrimmer;
    const defaultPipelineFn = this.defaultPipelineFunction;

    return super.generateIndex(function () {
      this.use(customTrimmer(defaultPipelineFn));

      this.ref("ref");

      for (const field of fields) {
        this.field(field);
      }

      for (const entry of qualityRules) {
        this.add(entryBuilder(entry));
      }
    });
  }

  import() {
    if (fs.existsSync(this.folderPath)) {
      return super.import(this.folderPath);
    }
  }

  export() {
    return super.export(this.folderPath);
  }


}

module.exports = QualityRuleSearchIndex;