const Struct = require('./dataConstruct/struct');
const fs = require('fs');
const root = require('app-root-path');
const TechnologiesMap = require('./technologies-map');
const UniqueArray = require('../lib/uniq');

const QualityRule = Struct(
  'id',
  'name',
  'alternativeName',
  'href',
  'critical',
  'maxWeight',
  'associatedValueName',
  'description',
  'output',
  'rationale',
  'remediation',
  'sample',
  'remediationSample',
  'reference',
  'total',
  'businessCriteria',
  'technicalCriteria',
  'technologies',
  'qualityStandards'
);

const MapTechnology = (technology) => {

  const technologyIndexInMap = TechnologiesMap.aip.findIndex(t => t.name === technology),
    tl = TechnologiesMap.aip.length;

  if (technologyIndexInMap > -1) {
    return TechnologiesMap.aip[technologyIndexInMap];
  }

  for (let i = 0; i < tl; i++) {
    const _Technology = TechnologiesMap.aip[i];
    if (_Technology.glob === null) continue;
    const globIndex = _Technology.glob.findIndex( t => t.name === technology);

    if( globIndex > -1 ) return _Technology;
  }

  return null;
};

const QualityRuleObject = (data) => {
  return new QualityRule(
    data.id,
    data.name,
    data.alternativeName,
    data.href,
    data.critical,
    data.maxWeight,
    data.associatedValueName,
    data.description,
    data.output,
    data.rationale,
    data.remediation,
    data.sample,
    data.remediationSample,
    data.reference,
    data.total,
    data.businessCriteria,
    data.technicalCriteria,
    UniqueArray(data.technologies.map(t => MapTechnology(t.name)).filter(e => e !== undefined && e !== null), (val) => val.name),
    data.qualityStandards
  );
};

const ProcessRuleDetailsRequest = ( req, res, errorHandler ) => {
  const jsonReg = /.json/i,
    url = jsonReg.test(req.path) ? req.path : req.path + '.json';
  fs.readFile(root.resolve('/rest/AIP/' + url), (err, dataBuffer) => {
    if(err){
      errorHandler(err, res);
    }
    try {
      const data = JSON.parse(dataBuffer);
      res.json(
        QualityRuleObject(data)
      );
    } catch (error) {
      res.sendStatus(404);
    }
  });
};

const getRulesDetailsFromFile = ( filePath ) => {
  if(!fs.existsSync(filePath)) return {};
  try {
    const fileData = fs.readFileSync(filePath),
      data = JSON.parse(fileData);
  
    return QualityRuleObject(data);
    
  } catch (error) {
    console.log(error.stack);
  }
};

module.exports = {
  ProcessRuleDetailsRequest,
  getRulesDetailsFromFile
};
