const fs = require('fs');
const root = require('app-root-path');
const path = require('path');
const Struct = require('./dataConstruct/struct');

const Item = new Struct('id', 'name', 'href', 'count', 'notapplicable');


function isApplicable( list ){
  try {
    const validationData = fs.readFileSync(path.resolve(__dirname,'validation', 'standards-validation.json'));
    const v_data = JSON.parse(validationData);
    return list.map( e => {
      const idFound = v_data.find( a => a === e.id );
  
      return new Item(e.id, e.name, e.href, e.count, idFound ? true : false);
    });
    
  } catch (error) {
    console.log(error.stack);
  }
}

function handler( req, res, errorHandler ){
  const echo = req.query.q === 'echo';
  const filepath = root.resolve('rest/' + (echo ? 'Echo' : 'AIP') + '/' + req.path + '/items.json');
  if (fs.existsSync(filepath)) {
    let data;
    const file = fs.readFileSync(filepath, {encoding: 'utf8'});
    try{
      data = JSON.parse(file);
    } catch(err){
      return errorHandler(err, res);
    }
    return res.json( isApplicable( data ));
  } else {
    return errorHandler({statusCode: 404,
      error: 'file:' + req.url +'/items.json not found'}, res);
  }
}

module.exports = handler;