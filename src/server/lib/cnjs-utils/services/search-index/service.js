const lunr = require("lunr");
const fs = require("fs");
const util = require("util");
const WC = lunr.Query.wildcard;

class IndexService {

  constructor() {
    this.index = lunr(function () { });
  }

  /**
   * @param {string} queryString 
   */
  query(queryString) {
    const sqs = queryString && this.sanitize(queryString);

    return this.rawQuery(sqs);
  }

  /**
   * @param {string} queryString 
   */
  rawQuery(queryString) {
    const results = [];

    if (queryString) {
      results.push(...this.index.search(`*${queryString}*`));
      results.push(...this.index.search(`*${queryString}`));
      results.push(...this.index.search(`${queryString}*`));
      results.push(...this.index.search(queryString));
    }

    return results;
  }

  /**
   * @param {string} queryString 
   */
  sanitize(queryString) {
    return queryString.replace(/[:*^~+-]/gi, "").trim();
  }

  /**
   * @param {string[]} terms
   * @param {string} searchBy
   * @returns {Array<lunr.Index.Result>}
   */
  wideSearch(terms = [], searchBy) {
    const cap = 300;
    let len = 0;
    let results = new Array(cap);
    const flags = [
      WC.NONE,
      WC.LEADING,
      WC.TRAILING,
      WC.LEADING | WC.TRAILING
    ];

    for (const flag of flags) {
      const ress = this.search(terms, searchBy, flag, true);

      l2: for (const res of ress) {
        if (flag !== WC.NONE) {
          for (let i = 0; i < len; i++) {
            if (res.ref === results[i].ref) {
              continue l2;
            }
          }
        }

        if (len < cap) {
          results[len] = res;
        } else {
          results.push(res);
        }
        len += 1;
      }
    }

    return len < cap ? results.slice(0, len) : results;
  }

  /**
   * @param {string[]} terms
   * @param {string} searchBy
   */
  looseSearch(terms = [], searchBy) {
    return this.search(terms, searchBy, WC.LEADING | WC.TRAILING, true)
  }

  /**
   * @param {string[]} terms
   * @param {string} searchBy
   */
  search(terms = [], searchBy, wildcard = WC.NONE, usePipeline = false) {
    return this.index.query(query => {
      for (const term of terms) {
        query.clause({
          boost: 1,
          fields: searchBy ? [searchBy] : query.allFields,
          term: term,
          usePipeline,
          wildcard,
        });
      }
    });
  }

  /**
   * @param {lunr.Token} token 
   */
  defaultPipelineFunction(token) {
    return token.update(function (s) {
      return s.toLowerCase();
    });
  }

  /**
   * @param {(token: string) => string} pipelineFn 
   */
  customTrimmer(pipelineFn) {

    /**
     * @param {lunr.Builder} builder 
     */
    function handler(builder) {
      if (!lunr.Pipeline.registeredFunctions.customTrimmer) {
        lunr.Pipeline.registerFunction(pipelineFn, "customTrimmer");
      }

      builder.pipeline.before(lunr.stopWordFilter, pipelineFn);
      builder.pipeline.remove(lunr.trimmer);
    }

    return handler;
  }

  /**
   * @param {Function} configFn 
   */
  generateIndex(configFn) {
    this.index = lunr(configFn);

    return this.index;
  }

  /**
   * @param {string} pathLike 
   */
  async import(pathLike) {
    try {
      const buff = await util.promisify(fs.readFile)(pathLike);
      const jsn = JSON.parse(buff.toString());

      this.index = lunr.Index.load(jsn);
    } catch (error) {
      this.index = lunr(function () { });
    }

    return this.index;
  }

  /**
   * @param {string} pathLike 
   */
  export(pathLike) {
    return util.promisify(fs.writeFile)(pathLike, JSON.stringify(this.index));
  }
}

module.exports = IndexService;