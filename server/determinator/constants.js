const path = require('path');

module.exports = {
  queryKey: 'q',
  extPath: path.resolve(__dirname, '..' , '..', 'rest', 'AIP', 'extensions'),
  versionTypes:{
    LTS: 'LTS',
    FUNCREL: 'FUNCREL',
    ALPHA: 'ALPHA',
    BETA: 'BETA'
  }
};