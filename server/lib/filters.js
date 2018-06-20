
const filters = require('./filter');
const MultiQuery = require('./multiqueryurl');
const STRUCT = require('./dataConstruct/struct');
const KeyMap = require('./dataConstruct/keyMap');

const filteredElement = STRUCT('id', 'name','href', 'glob');
const KEYS = KeyMap(filters);

const is = ( key, id ) => {
  switch (key) {
  case KEYS.pure:
    return filters.pure( id );    
  default:
    return filters[key].indexOf( id ) === -1 ? false : true;
  }
};

const getEntries = ( key, arrList ) => arrList.filter( entry => is( key, entry.id ) );

const genGlobURL = ( entriesArray ) => {
  const urls = entriesArray.map( a => a.href + '/quality-rules' ),
    globURL = MultiQuery( ...urls );
  return globURL;
};

const filterFor = ( key, listArray, title, __map ) => {
  const entries = getEntries( key, listArray );
  __map.validate( key );
  return new filteredElement( filters[key][0], title, genGlobURL( entries ), entries );
  /*({
    id: filters[key][0],
    name: title,
    href: genGlobURL( entries ),
    glob: entries,
  });*/
};

function StatusMap ( keys ){
  const ml = keys.length;
  for (let i = 0; i < ml; i++) {
    switch (keys[i]) {
    case KEYS.pure:
    case KEYS.all:
      break;
    default:
      this[keys[i]] = false;
      break;
    }
  }

  return this;
}

StatusMap.prototype.validate = function validate ( key ){ 
  this[key] = true; 
};

const createStatusMap = () => {
  const keys = Object.keys(filters),
    ret = new StatusMap( keys );

  return ret;
};

const filterArray = ( listArray ) => {
  let statusMap = createStatusMap();

  const filtered = listArray.map( listEntry => {
    const eId = listEntry.id;

    if( is(KEYS.pure, eId) ) return listEntry;

    let ret;

    if (statusMap.cpp === false && is(KEYS.cpp, eId)){
      ret = filterFor(KEYS.cpp, listArray, 'C/C++', statusMap);
    } else if (!statusMap.dotNet && is(KEYS.dotNet, eId)){
      statusMap.validate(KEYS.dotNet);
      return;
    } else if (!statusMap.rpg && is(KEYS.rpg, eId)){
      ret = filterFor(KEYS.rpg, listArray, 'RPG', statusMap);
    } else if (!statusMap.pli && is(KEYS.pli, eId)){
      ret = filterFor(KEYS.pli, listArray, 'PLI', statusMap);
    } else if (!statusMap.mssql && is(KEYS.mssql, eId)){
      ret = filterFor(KEYS.mssql, listArray, 'SQL Server', statusMap);
    } else if (!statusMap.sap && is(KEYS.sap, eId)){
      ret = filterFor(KEYS.sap, listArray, 'SAP', statusMap);
    } else if (!statusMap.html5js && is(KEYS.html5js, eId)){
      ret = filterFor(KEYS.html5js, listArray, 'HTML5 JavaScript', statusMap);
    }

    return ret;
  });
  return filtered.filter( ele => ele !== undefined );
};

module.exports = filterArray;
