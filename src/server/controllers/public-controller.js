const { StaticController } = require("../lib/cnjs-utils/server");
// const { types: folderTypes } = require("../services/folder-service");
const path = require("path");
const fs = require("fs");
// const { publicUrl, documentStoreURL } = require("../config");
// const log = require("../log");

class PublicController extends StaticController {

  /**
   * @param {import("../config/configuration").Configuration} configruation
   * @param {import("winston").Logger} logger
   * @param {string} distributionFolder
   */
  constructor(endPoint, ignore, spa, logger, distributionFolder, configruation) {
    super(endPoint, {
      dir: distributionFolder,
      ignore: ignore,
      spa,
    }, {
      dotfiles: "ignore",
      index: false,
      maxAge: "1d",
      redirect: false,
      setHeaders(res) {
        res.set("x-timestamp", Date.now());
        res.set("x-sent", true);
      },
    });
    this._endpoint = endPoint;
    this._log = logger;
    this.publicUrl = configruation.publicUrl;
    this.indexFilePath = path.join(distributionFolder, "index.html");
  }

  $postprocess() {
    this._log.info(`${this.constructor.name} Initialized`);
  }

  $preprocess() {
    const log = this._log;
    const publicUrl = this.publicUrl || this._endpoint;

    if (fs.existsSync(this.indexFilePath)) {
      const baseHtml = fs.readFileSync(this.indexFilePath);

      fs.writeFileSync(this.indexFilePath, baseHtml
        .toString()
        .replace(/(?<=<base\shref=")(.{0,})(?="\starget="_blank">)/ig, publicUrl));
      log.info("Public index file base url set to " + publicUrl);
    }
  }
}

module.exports = PublicController;