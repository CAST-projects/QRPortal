const uniqueArray = require('../../lib/uniq');
const generateVersionLabel = require('../../lib/versionNamePP');

const BOTH = 'Both';

function compareArrays( arr1, arr2, arr1Name, arr2Name, compareFunc ){
  const combinedUniqueArr = uniqueArray([].concat(...arr1, ...arr2), compareFunc);

  return combinedUniqueArr.map( ele => {
    const isInArr1 = arr1.find( e => compareFunc(ele) === compareFunc(e) ) ? true : false,
      isInArr2 = arr2.find( e => compareFunc(ele) === compareFunc(e) ) ? true : false;
    
    let parent = (isInArr1 ? (isInArr2 ? BOTH : arr1Name) : arr2Name);

    return Object.assign({}, ele, { parent: parent, label: parent !== BOTH ? generateVersionLabel(parent) : parent});
  });
}

function compareOnId( arr1, arr2, arr1Name, arr2Name, middleware ){
  const compareValueConverter = ( item ) => item.id,
    data = compareArrays( arr1, arr2, arr1Name, arr2Name, compareValueConverter );
  return middleware ? middleware(data) : data ;
}

function compareOnJSON( arr1, arr2, arr1Name, arr2Name, middleware ){
  const compareValueConverter = ( item ) => {
      try {
        return JSON.stringify(item);
      } catch (error) {
        return;
      }
    },
    data = compareArrays( arr1, arr2, arr1Name, arr2Name, compareValueConverter );

  return middleware ? middleware(data) : data ;
}

module.exports = {
  compareOnId: compareOnId,
  compareOnJSON: compareOnJSON
};