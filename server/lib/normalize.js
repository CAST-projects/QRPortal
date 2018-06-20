const jsonExt = '.json';
const AIP = 'AIP/';

function normalize(url){
  const dirTest = /AIP\//ig.test(url);
  return dirTest ? normalizeFileName(url) : AIP.concat( normalizeFileName(url));
}

function normalizeFileName( fileName ){
  return (/(\.json)/ig.test(fileName) ? fileName : fileName + jsonExt);
}

module.exports = normalize;