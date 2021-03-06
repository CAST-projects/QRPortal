const express = require('express');
const options = require('./options');
const { main } = require('../routes/routes');
const logger = require('../logger/rules');
const HydObj = require('./lib/hydrate');
const ValidateQuery = require('./lib/validateQuery');
const extensionsMap = require('../lib/extensions-map');
const notFound = require('../middleware/notFound');
const errHandler = require('../middleware/errorHandler');
let Router = express.Router();

Router.get(main, async (req, res) => {
  const queryValid = await ValidateQuery(req.query);
  if(queryValid) {
    res.sendFile('index.html', options, (err) => errHandler(err, res));
  } else {
    notFound(req, res);
  }
});

Router.get('/packages', ( req, res ) => {
  res.redirect('/rules?q=packages');
});

Router.get('/hydrate/packages', ( req, res ) => {
  res.json({
    path: [{ name: 'Packages', href: 'AIP/extensions', icon: '/img/sources.svg' }],
    nav: {
      data: extensionsMap.extensions,
      title: 'Packages',
      icon: '/img/sources.svg',
      query: '/aip/extensions'
    },
    data: [],
    navView: true
  });
});

Router.get('/hydrate', async(req, res) => {
  if( req.query.q === 'packages' ) return res.redirect('/rules/hydrate/packages');
  res.json(await HydObj(req.query, /bestpractices/gi.test(req.headers.referer)));
});

Router.get('/bundle.js', (req, res)=> {
  res.sendFile('bundle.js', options, (err)=>{
    if ( err ) {
      logger.error( err );
      res.status(500).send({error: 'a problem occured'});
    }
  });
});

// Router.get('/bundle.js.map', (req, res)=> { // remove for production use
//   res.sendFile('bundle.js.map', options, (err)=>{
//     if ( err ) {
//       console.log( err ); // replace with error logger
//       res.status(500).send({error: 'a problem occured'});
//     }
//   });
// });

module.exports = Router;