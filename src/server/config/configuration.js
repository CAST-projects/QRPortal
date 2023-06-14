class HttpsConfiguration {
  /**
   * @param {Object} params 
   */
  constructor(params = {}){
    this.key = params.key;
    this.cert = params.cert;
  }

  isValid(){
    return this.key && this.cert;
  }
}
class Configuration {
  /**
   * @param {Object} params 
   */
  constructor(params = {}){

    this.extendUrl = params.extend_url;
    this.pngIconRepo = params.icon_repo_url_png;
    this.svgIconRepo = params.icon_repo_url_svg;

    this.sessionKey = params.session_key;
    
    this.port = Number(params.port);
    this.logDir = params.log_dir;
    this.publicUrl = params.public_url || `http://localhost:${this.port}/`;
    this.contextPath = params.context_path ? params.context_path : undefined;

    this.https = new HttpsConfiguration(params.https);
  }
}

module.exports = {
  Configuration,
};