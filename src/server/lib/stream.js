const { comparers, order, insertionSort } = require('./sorting');
const { ASC } = order;
const { standardComparer, getComparator, objectComparator } = comparers;


const STREAM_OPS = {
  FILTER: 'FILTER',
  MAP: 'MAP',
  GROUP: 'GROUP',
  EACH: 'EACH',
  SORT: 'SORT',
}

class StreamOp {

  /**
   * @template {T}
   * @param {'FILTER' | 'MAP'} type 
   * @param {(obj: T, index: number, arr: Array<T>) => bool | any} delegate 
   */
  constructor(type, delegate) {
    this.type = type;
    this.delegate = delegate;
  }

  /**
   * @param {T} obj 
   * @param {number} index 
   * @param {T[]} arr 
   * @param {...Any} params
   */
  execute(obj, index, arr, ...params) {
    return this.delegate(obj, index, arr, ...params);
  }
}

class GroupOp extends StreamOp {

  /**
   * @template {T}
   * @param {string | number | Symbol | null} name
   * @param {(obj: T) => boolean} delegate 
   * @param {{ exclusive: boolean }} options
   */
  constructor(name, delegate, options = {}) {
    super(STREAM_OPS.GROUP, delegate);
    this.name = name;
    this.options = options;
  }

  /**
   * @param {T} obj 
   * @param {number} index 
   * @param {T[]} arr 
   */
  execute(obj) {
    if (this.name && this.delegate) {
      const g = this.delegate(obj);
      if (g) {
        return this.name;
      }
    } else if (!this.name && this.delegate) {
      const g = this.delegate(obj);
      if (g) {
        return g;
      }
    }

    return null;
  }
}

class Stream {

  /**
   * @template {T}
   * @param {Array<T>} array 
   */
  constructor(array = []) {
    this.arr = array;
    /** @type {StreamOp[]} */
    this.ops = [];
  }

  /**
   * @param {string} type 
   * @param {(obj: T, index: number, arr: Array<T>, ...args: Any[]) => bool | any} callback 
   * @returns {this}
   */
  appendOp(type, callback) {
    this.ops.push(new StreamOp(type, callback))

    return this;
  }

  /**
   * @param {(obj: T, index: number, arr: Array<T>) => bool} callback
   * @returns {this}
   */
  filter(callback) {
    return this.appendOp(STREAM_OPS.FILTER, callback);
  }

  /**
   * @template {Y}
   * @param {(obj: T, index: number, arr: Array<T>) => Y} callback
   * @returns {this}
   */
  map(callback) {
    return this.appendOp(STREAM_OPS.MAP, callback);
  }

  /**
   * @template {Y}
   * @param {(obj: T, index: number, arr: Array<T>) => void} callback
   * @returns {this}
   */
  each(callback) {
    return this.appendOp(STREAM_OPS.EACH, callback);
  }

  /**
   * @param {string} name 
   * @param {(obj: T) => bool} callback
   * @returns {this}
   */
  groupAs(name, callback, options) {
    this.ops.push(new GroupOp(name, callback, options));

    return this;
  }

  /**
   * @param {string} key 
   * @returns {this}
   */
  groupOn(key, options) {
    this.ops.push(new GroupOp(null, (obj) => obj[key], options))

    return this;
  }

  collectGroup() {
    const out = {};
    /** @type {GroupOp[]} */
    const groups = this.ops.filter(g => g.type === STREAM_OPS.GROUP);

    const push = (obj) => {
      for (const group of groups) {
        const gname = group.execute(obj);

        if (gname !== null) {
          if (!out[gname]) out[gname] = [];
          out[gname].push(obj);
        }
      }
    };

    this.aggregrate(push);

    return out;
  }

  /**
   * @param {'asc' | 'desc'} order 
   * @param {string | (obj: T) => any} orderBy 
   * @returns {this}
   */
  sort(order = ASC, orderBy) {
    if (typeof order === 'function') {
      return this.appendOp(STREAM_OPS.SORT,
        (item, _idx, _arr, output) => insertionSort(output, item, order));
    }

    return this.appendOp(STREAM_OPS.SORT,
      (item, _idx, _arr, output) => insertionSort(
        output,
        item,
        getComparator(
          order,
          orderBy
            ? objectComparator(standardComparer)
            : standardComparer,
          orderBy
        )
      )
    );
  }

  aggregrate(callback, ...params) {
    const ops = this.ops;
    const opsl = ops.length;
    const arr = this.arr;
    const arrl = this.arr.length;

    aggregate1: for (let arrIdx = 0; arrIdx < arrl; arrIdx++) {
      let item = arr[arrIdx];

      for (let index = 0; index < opsl; index++) {
        const op = ops[index];

        if (op.type === STREAM_OPS.FILTER && !op.execute(item, arrIdx, arr)) {
          continue aggregate1;
        }

        if (op.type === STREAM_OPS.MAP) {
          item = op.execute(item, arrIdx, arr);
        }

        if (op.type === STREAM_OPS.EACH) {
          op.execute(item, arrIdx, arr);
        }

        if (op.type === STREAM_OPS.SORT) {
          op.execute(item, arrIdx, arr, ...params);
        }
      }

      callback(item, ...params);
    }

    this.ops = [];

    return this;
  }

  collect() {
    if (this.ops.length > 0) {
      const out = [];
      let size = 0;
      const push = obj => {
        if (out.length === size) {
          out.push(obj);
          size++;
        }
      }

      this.aggregrate(push, out);
      this.arr = out;
    }

    return this.arr;
  }

  max(callback) {
    let value = null;
    let selectedValue = null;

    const maybeReplace = obj => {
      const selectedObj = callback ? callback(obj) : obj;

      if (value === null) {
        value = obj;
        selectedValue = selectedObj;
      } else if (selectedObj > selectedValue) {
        value = obj;
        selectedValue = selectedObj;
      }
    }

    this.aggregrate(maybeReplace);

    return value;
  }

  min(callback) {
    let value = null;
    let selectedValue = null;

    const maybeReplace = obj => {
      const selectedObj = callback ? callback(obj) : obj;

      if (value === null) {
        value = obj;
        selectedValue = selectedObj;
      } else if (selectedObj < selectedValue) {
        value = obj;
        selectedValue = selectedObj;
      }
    }

    this.aggregrate(maybeReplace);

    return value;
  }

  sum(callback) {
    let total = null;

    const _sum = obj => {
      const selectedObj = callback ? callback(obj) : obj;

      if (total === null) {
        total = selectedObj;
      } else {
        total += selectedObj;
      }
    }

    this.aggregrate(_sum);

    return total;
  }

  count() {
    return this.collect().length;
  }
}

function stream(arr = []) {
  return new Stream(arr);
}

module.exports = {
  stream,
  Stream,
  GroupOp,
  StreamOp,
};