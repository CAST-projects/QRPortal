const { standardComparer } = require('./comparers');

/**
 * @param {Array<any>} array
 * @param {Function} comparator
 * @returns {Array<any>}
 */
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);

    if (order !== 0) {
      return order;
    }

    return a[1] - b[1];
  });

  return stabilizedThis.map(el => el[0]);
}

/**
 * @param {Array<any>} array
 * @param {Function} comparator
 * @returns {Array<any>}
 */
function standardSort(array, comparator) {
  return array.sort(comparator);
}

function insertionSort(array, element, comparator = standardComparer) {
  let len = array.length;

  if (len === 0) {
    array.push(element);
    return;
  }

  let i = len;

  while (i > 0) {
    const cmp = comparator(array[i - 1], element);

    if (cmp === -1 || cmp === 0) {
      array.splice(i, 0, element);
      break;
    }

    i--;
  }

  if (i === 0) {
    array.unshift(element);
  }
}

module.exports = {
  stableSort,
  standardSort,
  insertionSort,
}