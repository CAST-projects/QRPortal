const { loggerFactory, logLevel, consoleTransportFactory, dailyRotationFileTransportFactory } = require("../../lib/cnjs-utils/log");
const { types } = require("../folder-service");
/**
 * @param {import("../folder-service/service")} folderService 
 */
function logFactory(folderService){
  return loggerFactory([
    dailyRotationFileTransportFactory(logLevel.debug, folderService.from(types.logs, `%DATE%`), true, false),
    consoleTransportFactory(logLevel.debug, true),
  ]);
}

module.exports = logFactory;