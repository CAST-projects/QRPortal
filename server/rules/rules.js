const express = require('express');
const options = require('./options');
const { main } = require('../routes/routes');
const technoMapping = require('../lib/technologies-map');
const extensions = require('../../rest/AIP/extensions.json').filter( e => e.qualityModel === true );
const errLogger = require('../logger/error');
let rulesRouter = express.Router();

rulesRouter.get(main, (req, res) => {
  res.sendFile('index.html', options, (err)=>{
    if ( err ) {
      errLogger.error( err );
      res.status(500).send({error: 'a problem occured'});
    }
  });
});

rulesRouter.get('/QRPortal.js', (req, res)=> {
  res.sendFile('QRPortal.js', options, (err)=>{
    if ( err ) {
      errLogger.error( err );
      res.status(500).send({error: 'a problem occured'});
    }
  });
});

rulesRouter.get('/QRPortal.js.map', (req, res)=> {
  res.sendFile('QRPortal.js.map', options, (err)=>{
    if ( err ) {
      errLogger.error( err );
      res.status(500).send({error: 'a problem occured'});
    }
  });
});

rulesRouter.get('/style.css', (req, res)=> {
  res.sendFile('src/css/style.css', options, (err)=>{
    if ( err ) {
      errLogger.error( err );
      res.status(500).send({error: 'a problem occured'});
    }
  });
});

rulesRouter.get('/technologies.json', (req, res) => {
  res.json( technoMapping );
});

rulesRouter.get('/extensions.json', (req, res) => {
  res.json( extensions );
});

module.exports = rulesRouter;