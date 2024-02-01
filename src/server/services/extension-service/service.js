const { BaseExtension, ExtensionVersion, Extension, QualityRuleReference } = require("../data-serializer/models");
const types = require("../data-reader/types");

class NameCleaner {
  constructor() {
    this.toClean = [' technology', ' Linker', 'for ', 'for Java', 'Techonology Extension For', 'Technology Extension For ', ' Framework', 'Support of ', 'Technology Extension'];
    this.exceptions = ['System Level Rules', 'Web Services', 'CAST AIP'];
  }

  clean(name) {
    const cl = this.toClean.length;
    let cleanName = name;

    for (let i = 0; i < cl; i++) {
      const wordToRemove = this.toClean[i];
      cleanName = cleanName.replace(wordToRemove, '');
    }

    return (cleanName.includes('Analyzer') || this.exceptions.indexOf(cleanName) !== -1) ? cleanName : cleanName + ' Analyzer';
  }
}

class ExtensionDataReader {

  /**
   * @param {import("../data-reader/service")} dataReader
   * @param {import("../data-serializer/serializer")} serializer
   */
  constructor(dataReader, serializer) {
    this.dataReader = dataReader;
    this.serializer = serializer;
    this.cleaner = new NameCleaner();

    this.extensions = {};

    this.extensionVersions = {};
  }

  async initMapping() {
    const extensions = await this.dataReader.listExtensions();
    const aipInfo = { name: types.aipId, title: "CAST AIP", href: `${types.aip}/${types.extensions}/${types.aipId}`, qualityModel: true, transactionsConfiguration: true };
    this.setExtensionInfo(types.aipId, aipInfo, await this.dataReader.listVersions());

    for (const extension of extensions) {
      const id = extension.name;
      const extensionInfo = await this.dataReader.readExtension(id);
      const versions = await this.dataReader.listExtensionVersions(id);
      extensionInfo.hasRules = false;

      for (const version of versions) {
        const verInfo = await this.readVersion(id, version.name);
        version.count = verInfo.qualityRules ? verInfo.qualityRules.length : 0;
        if (!extensionInfo.hasRules && version.count > 0) {
          extensionInfo.hasRules = true;
        }
      }

      extensionInfo.title = this.cleaner.clean(extensionInfo.title);

      this.setExtensionInfo(id, extensionInfo, versions);
    }
  }

  /**
   * @param {string} id 
   * @param {*} info 
   * @param {Array<*>} versions 
   */
  setExtensionInfo(id, info, versions) {
    this.extensions[id] = this.serializer.serialize(info, BaseExtension);
    this.extensionVersions[id] = this.serializer.serialize(info, Extension);
    this.extensionVersions[id].items = this.serializer.serialize(versions, ExtensionVersion);
  }

  list() {
    return Object.values(this.extensions);
  }

  /**
   * @param {string} id 
   */
  read(id) {
    return this.extensionVersions[id];
  }

  /**
   * @param {string} id 
   * @param {string} version 
   */
  async readVersion(id, version) {
    let extensionVersion, qualityRules;

    if (id === types.aipId) {
      extensionVersion = this.serializer.serialize(await this.dataReader.readVersion(version), ExtensionVersion);
      qualityRules = this.serializer.serialize(await this.dataReader.readVersionQualityRules(version), QualityRuleReference);
    } else {
      extensionVersion = this.serializer.serialize(await this.dataReader.readExtensionVersion(id, version), ExtensionVersion);
      qualityRules = this.serializer.serialize(await this.dataReader.readExtensionVersionQualityRules(id, version), QualityRuleReference);
    }

    extensionVersion.qualityRules = qualityRules;

    return extensionVersion;
  }
}

module.exports = ExtensionDataReader;