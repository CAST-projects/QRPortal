const UNIQ = require('../lib/uniq');
const path = require('path');
const { restDir } = require('../routes/paths');
const normalize = require('../lib/normalize');

function concatQueries( ...urls ){
  let ret;
  const arr = urls.map( url => require( path.join( ...restDir, normalize(url) ) ));
  ret = [].concat(...arr);
  ret = UNIQ( ret, (val) => val.id );
  return ret;
}

module.exports = concatQueries;