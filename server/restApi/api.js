const express = require('express');
const { main } = require('../routes/routes');
const options = require('./options');
const errHandler = require('../middleware/errorHandler');
const concatQueries = require('./concatQueries');
const QueryParser = require('../lib/queryParser');
const StatLogger = require('../logger/restStats');
const normalize = require('../lib/normalize');

let apiRouter = express.Router({caseSensitive: false});

apiRouter.get(main, ( req, res ) => {
  const queryKey = 'q', query = QueryParser(req.query, queryKey);
  if (query.length > 1) {
    StatLogger.info( query );
    concatQueries( ( ret )=> res.json( ret ), (err) => errHandler(err, res), ...query );
  } else if ( query.length === 1 ){
    StatLogger.info( query );
    res.sendFile(normalize(query[0]), options, (err) => errHandler(err, res));
  } else {
    StatLogger.info( query );
    res.sendFile("/Root.json", options, (err) => errHandler(err, res)); 
  }
});

apiRouter.get('*', (req, res) => {
  StatLogger.info( req.url );
  res.sendFile(normalize(req.url), options, (err) => errHandler(err, res));
});

module.exports = apiRouter;