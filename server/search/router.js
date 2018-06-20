const express = require('express');
const { searchRoute } = require('../routes/routes');
const searchIndex = require('./qr_searchParser');
const logger = require('../logger/search');
let searchRouter = express.Router();

searchRouter.get(searchRoute, (req, res) => {
  const searchParams = {
    query: req.query.q,
    index: req.params.filter
  };
  const ret = searchIndex( searchParams.query, searchParams.index );
  logger.info(searchParams);
  res.json(ret);
});

module.exports = searchRouter;