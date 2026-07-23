const fs = require('fs');
const root = require('app-root-path');

const qualityStandardsToFilter = ['AIP', 'PCI-DSS-V3.1'];

function inArray( val, arr ){
  return arr.indexOf( val ) !== -1;
}

function getQualityStandardsMap ( response, echo ){
  fs.readFile(root.resolve('rest/'+ (echo ? 'Carl' :'AIP') +'/quality-standards.json'), ( err, data ) => {
    if (err) {
      console.log(err);
      return response.sendStatus(404);
    }
    // const businessCriteria = {
    //   name: 'CAST',
    //   href: 'AIP/business-criteria',
    //   icon: 'img/castsoftwareblackbg.svg'
    // };
    const ret = JSON.parse(data).filter( e => !inArray(e.name, qualityStandardsToFilter)).map( e => {
      return {
        name: e.name,
        href: e.href + '/categories',
        icon: 'img/'+ e.name.toLowerCase() +'.svg'
      };
    });

    response.json(ret);
  });
}

module.exports = getQualityStandardsMap;
