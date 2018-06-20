const express = require('express');
const { main } = require('../routes/routes');
const options = require('./options');
const errHandler = require('../middleware/errorHandler');
const concatQueries = require('./concatQueries');
const QueryParser = require('../lib/queryParser');
const StatLogger = require('../logger/restStats');
const normalize = require('../lib/normalize');

const queryKey = 'q';

let apiRouter = express.Router();

apiRouter.get(main, ( req, res ) => {
  const query = QueryParser(req.query, queryKey);
  StatLogger.info(query);
  if (query.length > 1) {
    const ret = concatQueries( ...query );
    res.json(ret);
  } else {
    res.sendFile(normalize(query[0]), options, (err) => errHandler(err, res));
  }
});

module.exports = apiRouter;