const { DESC } = require('./order');
const typeOf = require('../type-of');

/**
   * @param {string|number} a
   * @param {string|number} b
   */
function standardComparer(a, b) {
  if (b < a) {
    return -1;
  }

  if (b > a) {
    return 1;
  }

  return 0;
}

/**
   * @param {string} a
   * @param {string} b
   */
function stringComparer(a, b) {
  return standardComparer(a.toLowerCase(), b.toLowerCase());
}

/**
   * @param {string} a
   * @param {string} b
   */
function stringPathComparer(a, b) {
  return stringComparer(a.replace(/\\|\//gi, ''), b.replace(/\\|\//gi, ''));
}

/**
 * @param {string| (obj: any) => any} orderBy
 */
function objectComparator(innerComparer = standardComparer) {
  /**
   * @param {object} a
   * @param {object} b
   * @param {string} orderBy
   */
  function handler(a, b, orderBy) {
    return typeof orderBy === 'function'
      ? innerComparer(orderBy(a), orderBy(b))
      : innerComparer(a[orderBy], b[orderBy]);
  }

  return handler;
}

/**
 * @param {string| (obj: any) => any} orderBy
 * @param {{ [string]: { [string]: number} }} weights
 * @param {number} defaultWeight
 */
function weightedObjectComparator(innerComparer = standardComparer, weights, defaultWeight = 0) {
  /**
   * @param {object} a
   * @param {object} b
   * @param {string} orderBy
   */
  function handler(a, b, orderBy) {

    if (typeof orderBy === 'function') {
      return innerComparer(orderBy(a, weights), orderBy(b, weights));
    } else {
      if (weights[orderBy]) {
        let weightA = weights[orderBy][a[orderBy]];
        let weightB = weights[orderBy][b[orderBy]];

        if (weightA === undefined || weightA === null) weightA = defaultWeight;

        if (weightB === undefined || weightB === null) weightA = defaultWeight;

        return innerComparer(weightA, weightB);
      } else {
        return innerComparer(a[orderBy], b[orderBy]);
      }
    }
  }

  return handler;
}

/**
   * @param {string} a
   * @param {string} b
   */
function smartComparator(a, b) {
  const type = typeOf(a);

  switch (type) {
    case 'string':
      return stringComparer(a, b);
    default:
      return standardComparer(a, b);
  }
}

/**
 * @param {string} orderBy
 * @param  {...import("./interfaces").IComparer<any>} comparers
 */
function multiComparator(...comparers) {

  /**
   * @param {object} a
   * @param {object} b
   * @param {string} orderBy
   */
  function handler(a, b, orderBy) {
    let result = 0;

    for (const comparer of comparers) {
      result = comparer(a, b, orderBy);

      if (result !== 0) {
        return result;
      }
    }

    return result;
  }

  return handler;
}

/**
 * @param {"desc"|"asc"} order
 * @param {import("./interfaces").IComparer<any>} comparer
 * @param {string} orderBy
 */
function getComparator(order, comparer, orderBy) {
  return order === DESC
    ? (a, b) => comparer(a, b, orderBy)
    : (a, b) => -comparer(a, b, orderBy);
}

function objectComparatorByKey(a, b, key) {
  return objectComparator(standardComparer)(a, b, key);
}

module.exports = {
  standardComparer,
  stringComparer,
  stringPathComparer,
  objectComparator,
  weightedObjectComparator,
  smartComparator,
  multiComparator,
  getComparator,
  objectComparatorByKey,
}