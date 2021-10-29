const { BaseSerializer } = require("../../lib/cnjs-utils/services/serializer");
const { BaseQualityStandard, QualityStandard, QualityStandardCategory, QualityStandardItem } = require("./models");
const QualityRuleReferenceSerializer = require("../data-reader/quality-rule-reference-serializer");
const QualityRuleReference = require("../data-reader/models/quality-rule-reference");

/**
 * @typedef {import("./models/base-quality-standard")} IBaseQualityStandard
 * @typedef {import("./models/quality-standard")} IQualityStandard
 * @typedef {import("../icon-url-builder/service")} IconUrlBuilder
 */

class QualityStandardDataSerializer extends BaseSerializer {
  
  /**
   * @param {IconUrlBuilder} iconUrlBuilder 
   */
  constructor(iconUrlBuilder, clsConstructor){
    super(clsConstructor);

    this.iconBuilder = iconUrlBuilder;
  }

  __serialize(data){
    const Ctor = this.Ctor;
    const model = new Ctor(data);

    model.iconUrl = data.name ? this.iconBuilder.createIconUrl(data.name.toLowerCase()) : null;

    return model;
  }
}

class QualityStandardItemSerializer extends QualityStandardDataSerializer {
  constructor(iconUrlBuilder){
    super(iconUrlBuilder, QualityStandardItem);
  }

  __serialize(data){
    const model = super.__serialize(data);

    const _path = data.href.split("/");

    _path[3] = "sections"

    model.href = _path.join("/");

    return model;
  }
}

class QualityStandardSerializer {

  /**
   * @param {import("../icon-url-builder/service")} iconUrlBuilder 
   */
  constructor(iconUrlBuilder){
    this.iconUrlBuilder = iconUrlBuilder;
    this.baseQualityStandardSerializer = new QualityStandardDataSerializer(iconUrlBuilder, BaseQualityStandard);
    this.qualityStandardSerializer = new QualityStandardDataSerializer(iconUrlBuilder, QualityStandard);
    this.qualityStandardCategorySerializer = new QualityStandardDataSerializer(iconUrlBuilder, QualityStandardCategory);
    this.qualityStandardCategoryItemSerializer = new QualityStandardItemSerializer(iconUrlBuilder);
    this.qualityRuleReferenceSerializer = new QualityRuleReferenceSerializer();
  }

  serialize(data, type){

    switch (type) {
      case BaseQualityStandard:
        return this.baseQualityStandardSerializer.serialize(data);
      case QualityStandard:
        return this.qualityStandardSerializer.serialize(data);
      case QualityStandardCategory:
        return this.qualityStandardCategorySerializer.serialize(data);
      case QualityStandardItem:
        return this.qualityStandardCategoryItemSerializer.serialize(data);
      case QualityRuleReference:
        return this.qualityRuleReferenceSerializer.serialize(data);
      default:
        throw new Error("Type unknown");
    }

    // return {
    //   id: model.id,
    //   name: model.name,
    //   href: model.href + "/categories",
    //   url: model.url,
    //   iconUrl: iconBuilder.createIconUrl(model.id.toLowerCase()),
    //   description: model.description,
    //   isoPatterns: model.isoPatterns,
    //   count: model.count,
    //   qualityRules: model.qualityRules
    // }
  }
}

module.exports = QualityStandardSerializer;