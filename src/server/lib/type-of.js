module.exports = function typeOf(value) {
  const nativeTypeOf = typeof value;

  if (nativeTypeOf !== 'object') {
    if (nativeTypeOf === 'number' && isNaN(value)) {
      return 'nan';
    }

    return nativeTypeOf;
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (value === null) {
    return 'null';
  }

  if (value instanceof Promise) {
    return 'promise';
  }

  return 'object';
}
