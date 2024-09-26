const express = require('express');
const fs = require('fs');
const path = require('path');
const readJsonFile = require('../lib/readFile');
const { infoDir, packagePath } = require('../routes/paths');
const { main } = require('../routes/routes');
const errLogger = require('../logger/error');

let aboutRouter = express.Router();

aboutRouter.get(main, (req,res)=>{
  fs.readFile( path.resolve(...infoDir, 'LICENSE'), 'utf8', ( err, fileContents ) => {
    if ( err ) {
      errLogger.error( err );
      res.status(500).send({error: 'a problem occured'});
    }
    readJsonFile(path.resolve(...packagePath), (fileName, jsonData ) =>{
      fs.readFile(path.resolve(__dirname, '..', 'info', 'changelog.json'), {encoding: 'utf8'}, (err, data) => {
        if (err){
          errLogger.error( err );
          res.status(500).send({error: 'a problem occured'});
        }
        try {
          const changeLog = JSON.parse(data);
          res.json({
            licence: fileContents, 
            version: jsonData.version, 
            news: changeLog[jsonData.version] || []
          });
        } catch (error) {
          res.sendStatus(502);
        }
      });
    }, undefined, (e) => {
      errLogger.error( e );
      res.status(500).send({error: 'a problem occured'});
    });
  });
});

module.exports = aboutRouter;