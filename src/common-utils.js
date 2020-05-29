// snippet import { typeOf,escapeHTML,unescapeHTML,isTruthy, isFalsy } from "./common-utils";
export function typeOf(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

export function escapeHTML(str) {
  if (str && typeOf(str) === 'String') {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  return str;
}

export function unescapeHTML(str) {
  if (str && typeOf(str) === 'String') {
    return str
      .replace(/(&lt;)/g, '<')
      .replace(/(&gt;)/g, '>')
      .replace(/(&quot;)/g, '"')
      .replace(/(&#39;)/g, "'")
      .replace(/(&amp;)/g, '&');
  }
  return str;
}

export function isFalsy(obj) {
  const res = (typeof obj === 'undefined') || (obj === null) || (obj === false);
  return res;
}

export function isTruthy(obj) {
  return !isFalsy(obj);
}
