const mongoose = require('mongoose');

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const containsOperator = (value) => {
  if (isPlainObject(value)) {
    return Object.keys(value).some(
      (key) => key.startsWith('$') || containsOperator(value[key])
    );
  }
  if (Array.isArray(value)) {
    return value.some(containsOperator);
  }
  return false;
};

const scalarOrNull = (value) => {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  return undefined;
};

const isObjectId = (value) => mongoose.isValidObjectId(value);

const toObjectId = (value) => {
  if (!mongoose.isValidObjectId(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

const clampInt = (value, fallback, min, max) => {
  let n = parseInt(value, 10);
  if (Number.isNaN(n)) n = fallback;
  const lo = Number.isFinite(min) ? min : -Infinity;
  const hi = Number.isFinite(max) ? max : Infinity;
  return Math.min(Math.max(n, lo), hi);
};

const truncate = (value, max) => String(value == null ? '' : value).slice(0, max);

module.exports = {
  isPlainObject,
  containsOperator,
  scalarOrNull,
  isObjectId,
  toObjectId,
  clampInt,
  truncate,
};