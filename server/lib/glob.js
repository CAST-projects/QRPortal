const fs = require('fs');
const path = require('path');

function Glob( dirName, onFileContent, onError, onComplete ){
  fs.readdir( dirName, ( err, fileNames ) => {
    if( err ){
      onError( err );
      return;
    }
    const len = fileNames.length;
    fileNames.forEach( ( fileName, index ) => {
      const PATH = path.join( dirName, fileName );
      fs.readFile( PATH, 'utf8', ( err, fileContents ) => {
        if ( err ) {
          onError( err );
          return;
        }
        try {
          
          onFileContent( fileName, JSON.parse(fileContents), index, PATH.toString() );
          if ( index === len -1 && onComplete) onComplete();
        } catch (error) {
          console.log(error.stack);
          onComplete();
        }
      });
    });
  });
}

module.exports = Glob;