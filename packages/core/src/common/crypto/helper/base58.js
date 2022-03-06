/**
 * It's based on base58-universal. It doesn't work with the current
 * TS config. 
 * 
 * @TODO Remove this implementation and use some proper package import
 */
'use strict';

// baseN alphabet indexes
const _reverseAlphabets = {};

const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * BaseN-encodes a Uint8Array using the given alphabet.
 *
 * @param {Uint8Array} input the bytes to encode in a Uint8Array.
 * @param {number} maxline the maximum number of encoded characters per line to
 *          use, defaults to none.
 *
 * @return {string} the baseN-encoded output string.
 */
function encode(input) {
  const maxline = undefined; 
  if (!(input instanceof Uint8Array)) {
    throw new TypeError('"input" must be a Uint8Array.');
  }
  if (typeof alphabet !== 'string') {
    throw new TypeError('"alphabet" must be a string.');
  }
  if (maxline !== undefined && typeof maxline !== 'number') {
    throw new TypeError('"maxline" must be a number.');
  }
  if (input.length === 0) {
    return '';
  }

  let output = '';

  let i = 0;
  const base = alphabet.length;
  const first = alphabet.charAt(0);
  const digits = [0];
  for (i = 0; i < input.length; ++i) {
    let carry = input[i];
    for (let j = 0; j < digits.length; ++j) {
      carry += digits[j] << 8;
      digits[j] = carry % base;
      carry = (carry / base) | 0;
    }

    while (carry > 0) {
      digits.push(carry % base);
      carry = (carry / base) | 0;
    }
  }

  // deal with leading zeros
  for (i = 0; input[i] === 0 && i < input.length - 1; ++i) {
    output += first;
  }
  // convert digits to a string
  for (i = digits.length - 1; i >= 0; --i) {
    output += alphabet[digits[i]];
  }

  if (maxline) {
    const regex = new RegExp('.{1,' + maxline + '}', 'g');
    output = output.match(regex).join('\r\n');
  }

  return output;
}

/**
 * Decodes a baseN-encoded (using the given alphabet) string to a
 * Uint8Array.
 *
 * @param {string} input the baseN-encoded input string.
 *
 * @return {Uint8Array} the decoded bytes in a Uint8Array.
 */
function decode(input) {
  if (typeof input !== 'string') {
    throw new TypeError('"input" must be a string.');
  }
  if (typeof alphabet !== 'string') {
    throw new TypeError('"alphabet" must be a string.');
  }
  if (input.length === 0) {
    return new Uint8Array();
  }

  let table = _reverseAlphabets[alphabet];
  if (!table) {
    // compute reverse alphabet
    table = _reverseAlphabets[alphabet] = [];
    for (let i = 0; i < alphabet.length; ++i) {
      table[alphabet.charCodeAt(i)] = i;
    }
  }

  // remove whitespace characters
  input = input.replace(/\s/g, '');

  const base = alphabet.length;
  const first = alphabet.charAt(0);
  const bytes = [0];
  for (let i = 0; i < input.length; i++) {
    const value = table[input.charCodeAt(i)];
    if (value === undefined) {
      return;
    }

    let carry = value;
    for (let j = 0; j < bytes.length; ++j) {
      carry += bytes[j] * base;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }

    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  // deal with leading zeros
  for (let k = 0; input[k] === first && k < input.length - 1; ++k) {
    bytes.push(0);
  }

  return new Uint8Array(bytes.reverse());
}

module.exports = { encode, decode }