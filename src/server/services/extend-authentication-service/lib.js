
function getUserInitials(user) {

}

const APIKEY_HEADER = 'x-nuget-apikey';

function containsApiKeyHeader(req) {
  return getApiKeyHeader(req) ? true : false;
}

function getApiKeyHeader(req) {
  return req.headers[APIKEY_HEADER];
}


module.exports = {
  APIKEY_HEADER,
  containsApiKeyHeader,
  getApiKeyHeader,
};