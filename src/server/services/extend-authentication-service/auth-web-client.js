const { WebClient } = require("../extend");
const { APIKEY_HEADER } = require("./lib");

class ExtendAuthWebClient extends WebClient {
  constructor(extendBaseUrl) {
    super(extendBaseUrl);
  }

  URLBuilderFactory() {
    return super.URLBuilderFactory()
      .append("api")
      .append("user");
  }

  async signin(username, password) {
    const urlBuilder = this.URLBuilderFactory().append("signin");

    try {
      const response = await this.post(urlBuilder.toString(),
        JSON.stringify({ uid: username, pwd: password }),
        { "Content-Type": "application/json" });

      return response.json();
    } catch (error) {
      return null;
    }
  }

  /**
   * @param {string} apikey 
   * @returns {Promise<import("./types").UserIdentity>}
   */
  async getIdentity(apikey) {
    const urlBuilder = this.URLBuilderFactory().append("identity")
    try {
      const response = await this.get(urlBuilder.toString(), {
        [APIKEY_HEADER]: apikey
      });

      return response.json();
    } catch (error) {
      return null;
    }
  }
}

module.exports = ExtendAuthWebClient;