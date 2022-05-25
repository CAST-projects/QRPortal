const { ConfigurationFactory } = require("../lib/cnjs-utils/config");
const { Configuration } = require("./configuration");
const { FolderService } = require("../services/folder-service");
const path = require("path");

/**
 * @param {import("../services/folder-service/folder-service")} folderService 
 */
function configurationFactory(){
  const folderService = new FolderService({});
  const configPath = process.env.CONFIG_PATH ? path.resolve(process.env.CONFIG_PATH) : folderService.fromRoot("config.json");

  return ConfigurationFactory({
    format: "json",
    newable: true,
    path: configPath,
  }, Configuration);
}

module.exports = configurationFactory;