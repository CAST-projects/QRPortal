const { BaseSerializer, Serializer } = require("../../lib/cnjs-utils/services/serializer");
const { BaseQualityStandard, QualityStandard, QualityStandardCategory, QualityStandardItem, 
  QualityRuleReference, QualityRule, QualityStandardItemReference, BaseExtension, ExtensionVersion, Extension,
  BaseBusinessCriteria, BusinessCriteria, TechnicalCriteriaReference, TechnicalCriteria, ServiceIndex, QualityTemplateReference } = require("./models");
const caseConvert = require("../../lib/case-convert");

/**
 * @typedef {import("./models/base-quality-standard")} IBaseQualityStandard
 * @typedef {import("./models/quality-standard")} IQualityStandard
 * @typedef {import("../icon-url-builder/service")} IconUrlBuilder
 */

class BaseDataSerializer extends BaseSerializer {
  constructor(clsConstructor){
    super(clsConstructor);
  }

  __serialize(data){
    const Ctor = this.Ctor;
    const model = new Ctor(data);

    return model;
  }
}
class DataSerializer extends BaseDataSerializer {
  
  /**
   * @param {IconUrlBuilder} iconUrlBuilder 
   */
  constructor(iconUrlBuilder, clsConstructor){
    super(clsConstructor);

    this.iconBuilder = iconUrlBuilder;
  }

  __serialize(data){
    const model = super.__serialize(data);

    model.iconUrl = data.name ? this.iconBuilder.createIconUrl(data.name.toLowerCase()) : null;

    return model;
  }
}

class QualityRuleSerializer extends DataSerializer{
  /**
   * @param {IconUrlBuilder} iconUrlBuilder 
   */
  constructor(iconUrlBuilder){
    super(iconUrlBuilder, QualityRule);

    this.iconBuilder = iconUrlBuilder;
  }

  __serialize(data){
    /** @type {QualityRule} */
    const Ctor = this.Ctor;
    const iconBuilder = this.iconBuilder;
    const model = new Ctor(data);

    model.qualityStandards = model.qualityStandards.map(_ => ({..._, iconUrl: _.standard ? iconBuilder.createIconUrl(_.standard.toLowerCase()) : null }));

    return model;
  }
}

class ServiceIndexSerializer extends BaseDataSerializer {

  /**
   * @param {IconUrlBuilder} iconUrlBuilder 
   */
   constructor(iconUrlBuilder){
    super(ServiceIndex);

    this.iconBuilder = iconUrlBuilder;
  }

  __serialize(data){
    const model = super.__serialize(data);

    model.iconUrl = data.name ? this.iconBuilder.createIconUrl(caseConvert.toParamCase(data.name.toLowerCase())) : null;

    for (const element of model.items) {
      element.iconUrl = element.name ? this.iconBuilder.createIconUrl(caseConvert.toParamCase(element.name.toLowerCase())) : null;
    }

    return model;
  }
}

class ExtensionDataSerializer extends BaseSerializer {
  
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

    if(!model.iconUrl){
      model.iconUrl = data.name ? this.iconBuilder.createIconUrl(data.name.toLowerCase()) : null;
    }

    return model;
  }
}

class QualityStandardItemReferenceSerializer extends BaseSerializer {
  
  /**
   * @param {IconUrlBuilder} iconUrlBuilder 
   */
  constructor(iconUrlBuilder){
    super(QualityStandardItemReference);

    this.iconBuilder = iconUrlBuilder;
  }

  __serialize(data){
    const Ctor = this.Ctor;
    const model = new Ctor(data);

    model.iconUrl = data.name ? this.iconBuilder.createIconUrl(data.id.toLowerCase()) : null;

    return model;
  }
}

class QualityStandardItemSerializer extends Serializer {
  constructor(iconUrlBuilder){
    super();

    this.iconBuilder = iconUrlBuilder;
  }

  /**
   * @param {*} data 
   * @param {QualityStandardItem} Model 
   * @param {string} categoryUrl 
   */
  __serialize(data, Model, categoryUrl){
    const model = super.__serialize(data, Model);

    model.iconUrl = data.id ? this.iconBuilder.createIconUrl(data.id.toLowerCase()) : null;
    model.href = [categoryUrl, "items", model.id].join("/");

    return model;
  }
}

class BusinessCriteriaSerializer extends BaseSerializer {
  constructor(iconUrlBuilder, cls){
    super(cls);

    this.iconBuilder = iconUrlBuilder;
  }

  __serialize(data){
    const Ctor = this.Ctor;
    const model = new Ctor(data);
    const name = data.name ? caseConvert.toParamCase(data.name.toLowerCase()) : null;

    model.iconUrl = name ? this.iconBuilder.createIconUrl(name) : null;

    return model;
  }
}

class DefaultSerializer {

  /**
   * @param {import("../icon-url-builder/service")} iconUrlBuilder 
   */
  constructor(iconUrlBuilder){
    this.iconUrlBuilder = iconUrlBuilder;
    this.baseQualityStandardSerializer = new DataSerializer(iconUrlBuilder, BaseQualityStandard);
    this.qualityStandardSerializer = new DataSerializer(iconUrlBuilder, QualityStandard);
    this.qualityStandardCategorySerializer = new DataSerializer(iconUrlBuilder, QualityStandardCategory);
    this.qualityStandardCategoryItemSerializer = new QualityStandardItemSerializer(iconUrlBuilder);
    this.qualityStandardItemReferenceSerializer = new QualityStandardItemReferenceSerializer(iconUrlBuilder);
    this.qualityRuleReferenceSerializer = new BaseDataSerializer(QualityRuleReference);
    this.qualityTemplateReferenceSerializer = new BaseDataSerializer(QualityTemplateReference);
    this.baseExtensionSerializer = new ExtensionDataSerializer(iconUrlBuilder, BaseExtension);
    this.extensionSerializer = new ExtensionDataSerializer(iconUrlBuilder, Extension);
    this.extensionVersionSerializer = new BaseDataSerializer(ExtensionVersion);
    this.qualityRuleSerializer = new QualityRuleSerializer(iconUrlBuilder, QualityRule);
    this.baseBusinessCriteriaSerializer = new BusinessCriteriaSerializer(iconUrlBuilder, BaseBusinessCriteria);
    this.businessCriteriaSerializer = new BusinessCriteriaSerializer(iconUrlBuilder, BusinessCriteria);
    this.technicalCriteriaReferenceSerializer = new BaseDataSerializer(TechnicalCriteriaReference);
    this.technicalCriteriaSerializer = new BaseDataSerializer(TechnicalCriteria);
    this.serviceIndexSerializer = new ServiceIndexSerializer(iconUrlBuilder);
  }

  serialize(data, type, ...params){

    switch (type) {
      case BaseQualityStandard:
        return this.baseQualityStandardSerializer.serialize(data);
      case QualityStandard:
        return this.qualityStandardSerializer.serialize(data);
      case QualityStandardCategory:
        return this.qualityStandardCategorySerializer.serialize(data);
      case QualityStandardItem:
        return this.qualityStandardCategoryItemSerializer.serialize(data, QualityStandardItem, ...params);
      case QualityRuleReference:
        return this.qualityRuleReferenceSerializer.serialize(data);
      case QualityTemplateReference:
        return this.qualityTemplateReferenceSerializer.serialize(data);
      case QualityStandardItemReference:
        return this.qualityStandardItemReferenceSerializer.serialize(data);
      case BaseExtension:
        return this.baseExtensionSerializer.serialize(data);
      case ExtensionVersion:
        return this.extensionVersionSerializer.serialize(data);
      case Extension:
        return this.extensionSerializer.serialize(data);
      case QualityRule:
        return this.qualityRuleSerializer.serialize(data);
      case BaseBusinessCriteria:
        return this.baseBusinessCriteriaSerializer.serialize(data);
      case BusinessCriteria:
        return this.businessCriteriaSerializer.serialize(data);
      case TechnicalCriteriaReference:
        return this.technicalCriteriaReferenceSerializer.serialize(data);
      case TechnicalCriteria:
        return this.technicalCriteriaSerializer.serialize(data);
      case ServiceIndex:
        return this.serviceIndexSerializer.serialize(data);
      default:
        throw new Error(`Serializer Type unknown: ${type && type.name}`);
    }
  }
}

module.exports = DefaultSerializer;