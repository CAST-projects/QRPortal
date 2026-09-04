const fs = require('fs');
const root = require('app-root-path');

function getQualityStandardsMap ( response, sync = false, echo ){
  if (sync) {
    const file = fs.readFileSync(root.resolve('rest/'+ (echo ? 'Echo' :'AIP') +'/business-criteria.json')),
      data = JSON.parse(file),
      map = data.map( e => {
        return Object.assign( {}, e, {
          standard: 'CAST',
          icon: 'img/' + e.name.toLowerCase().replace(/\s/, '') + '.svg'
        } );
      });
    return map;
  } 
  fs.readFile(root.resolve('rest/'+ (echo ? 'Echo' :'AIP') +'/business-criteria.json'), ( err, data ) => {
    if (err) {
      console.log(err);
    }

    try {
      const ret = JSON.parse(data).map( e => {
        return Object.assign( {}, e, {
          standard: 'CAST',
          icon: 'img/' + e.name.toLowerCase().replace(/\s/, '') + '.svg'
        } );
      });
  
      response.json(ret);
    } catch (error) {
      response.sendStatus(404);
    }
  });
}

module.exports = getQualityStandardsMap;
