const technologies = require('../../rest/AIP/technologies.json');
const technoFilter = require('./filters');

const technoMapping = technoFilter( technologies );

module.exports = technoMapping;
