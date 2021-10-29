const caseConvert = require("../../../lib/case-convert");

function ServiceIndexElement (name, description, href, iconUrl){
  this.name = name;
  this.description = description;
  this.href = href;

  this.iconUrl = iconUrl;
}

class ServiceIndex {
  constructor(id, data, iconUrl){
    this.id = id;
    this.iconUrl = iconUrl;
    this.items = [];

    for (const key in data) {
      const element = data[key];
      if(caseConvert.toParamCase(key) === "rules-history" || caseConvert.toParamCase(key) === "versions") continue;
      this.items.push(new ServiceIndexElement(caseConvert.spaceSeparated(key), element.name, `${this.id}/${caseConvert.toParamCase(key)}`));
    }

    this.items.push(new ServiceIndexElement("indexes", "Indexes in alphabetic order", `${this.id}/indexes`));
  }
}

module.exports = ServiceIndex;