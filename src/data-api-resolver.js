const DATA_DLG_REF = 'data-dlg-ref';

/**
 * 入力Elementに'data-dlg-prop'属性で指定されたプロパティの名前を返す
 * @param dlgInputEle
 * @returns {string}
 */
export function getInputPropertyName(dlgInputEle) {
  const dlgInputPropName = dlgInputEle.getAttribute('data-dlg-prop');
  return dlgInputPropName;
}

export function getAllSingleInputEles(parentEle, opt) {
  const searchTag = (opt && opt.tag) ? opt.tag : null;
  const searchValue = (opt && opt.val) ? opt.val : null;
  const strSearchTag = searchTag || '';
  const strSearchValue = searchValue ? `=${searchValue}` : '';
  return parentEle.querySelectorAll(`${strSearchTag}[data-dlg-prop${strSearchValue}]`);
}

export function getAllMultipleInputEles(parentEle, opt) {
  const searchTag = (opt && opt.tag) ? opt.tag : null;
  const searchValue = (opt && opt.val) ? opt.val : null;
  const strSearchTag = searchTag || '';
  const strSearchValue = searchValue ? `=${searchValue}` : '';
  return parentEle.querySelectorAll(`${strSearchTag}[data-dlg-multi-prop${strSearchValue}]`);
}

function getAllEles(parentEle, opt) {
  const searchTag = (opt.tag) ? opt.tag : null;
  const searchValue = (opt.val !== null && typeof opt.val !== 'undefined') ? opt.val : null;
  const searchAttr = (opt.attr) ? opt.attr : null;
  const strSearchTag = searchTag || '';
  const strSearchValue = searchValue ? `=${searchValue}` : '';
  return parentEle.querySelectorAll(`${strSearchTag}[${searchAttr}${strSearchValue}]`);
}

export function getAllDataRefEles(parentEle, opt) {
  const safeOpt = opt || {};

  return getAllEles(parentEle, { attr: DATA_DLG_REF, tag: safeOpt.tag, val: safeOpt.val });
}

/**
 * 入力Elementに'data-dlg-multi-prop'属性で指定されたプロパティの名前を返す
 * @param dlgInputEle
 * @returns {string}
 */
export function getMutiInputPropertyName(dlgInputEle) {
  const dlgInputPropName = dlgInputEle.getAttribute('data-dlg-multi-prop');
  return dlgInputPropName;
}

/**
 * 入力Elementに'data-dlg-input-type'属性で指定されたプロパティの型を返す
 * @param dlgInputEle
 * @returns {string}
 */
export function getInputPropertyType(dlgInputEle) {
  const inputPropertyType = dlgInputEle.getAttribute('data-dlg-input-type');
  if (inputPropertyType === 'text' || inputPropertyType === 'number' || inputPropertyType === 'boolean' || inputPropertyType === 'datetime' || inputPropertyType === 'date' || inputPropertyType === 'time') {
    return inputPropertyType;
  }
  throw Error(`Illegal input property type "${inputPropertyType}" specified on data-dlg-input-type attribute`);
}

/**
 * 複数表示、複数選択などで参照先データのプロパティ名を示す
 * @param dlgInputEle
 * @returns {string}
 */
export function getDataRefPropName(dlgInputEle) {
  const result = dlgInputEle.getAttribute(DATA_DLG_REF);
  return result;
}

export function getInputDataRefIdPropName(dlgInputEle) {
// 選択値にするプロパティ名
  const refIdPropName = dlgInputEle.getAttribute('data-dlg-ref-id');
  return refIdPropName;
}

export function getInputDataRefDispPropName(dlgInputEle) {
// 選択肢の表示につかうプロパティ名
  const refDispPropName = dlgInputEle.getAttribute('data-dlg-ref-disp');
  return refDispPropName;
}
