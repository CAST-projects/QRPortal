/**
 * @param {string} str 
 * @returns {string}
 */
function first(str = '') {
  if (typeof str !== 'string' || str.length <= 0) {
    return '';
  }

  return str.charAt(0)
}

module.exports = {
  first,
}