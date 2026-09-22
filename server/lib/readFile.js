const fs = require('fs');
const path = require('path');

function readJsonFile( filePath, onFileContent, onComplete, onError ){
  fs.readFile( path.resolve(filePath), 'utf8', ( err, fileContents ) => {
    if ( err ) {
      try {
        onError( err );
      } catch (error) {
        console.log(error.stack);
      }
      return;
    }
    try {
      onFileContent( filePath, JSON.parse(fileContents), onComplete );
    } catch (error) {
      console.log(error.stack);
    }
  });
}

module.exports = readJsonFile;