import { escapeHTML, isTruthy, typeOf } from "./common-utils.js";
import {
  getInputPropertyName,
  getInputPropertyType,
  getDataRefPropName,
  getAllMultipleInputEles
} from "./data-api-resolver.js";
import { doPopulateDatePickerToContext } from "./bind-from-view-datepicker-to-context.js";
import { getAllSingleInputEles, getInputDataRefDispPropName, getInputDataRefIdPropName } from "./data-api-resolver";

/**
 * 指定した要素のDATA API属性に従い値（単一）を取得する
 * @param dlgPropInputEle
 * @returns {*}
 */
export function getSingleValueOf(dlgPropInputEle) {
  if (dlgPropInputEle.tagName.toLowerCase() === 'input'
    || dlgPropInputEle.tagName.toLowerCase() === 'select'
  ) {

    const dlgInputPropName = getInputPropertyName(dlgPropInputEle);
    // プロパティとして格納される型定義済の入力コントロールの入力値
    const propValue = getTypedValue(dlgPropInputEle);

    if (dlgInputPropName) {
      return escapeHTML(propValue);
    }

  } else {
    throw Error(`Not currently supported element "${dlgPropInputEle.tagName}" as dialog input element.`);
  }
  return;
}

/**
 * 指定した要素のDATA API属性に従い値（複数）を取得する
 * @param dlgMultiPropHolderEle
 * @returns {[]}
 */
export function getMultiValuesOf(dlgMultiPropHolderEle) {
  const dispResourcePropName = getDataRefPropName(dlgMultiPropHolderEle);

  // 選択値にするプロパティ名
  const refIdPropName = getInputDataRefIdPropName(dlgMultiPropHolderEle);
  // 選択肢の表示につかうプロパティ名
  const refDispPropName = getInputDataRefDispPropName(dlgMultiPropHolderEle);

  const checkBoxes = dlgMultiPropHolderEle.querySelectorAll(`[id^=check-${dispResourcePropName}]`);
  const checkedStatus = [];

  for (let checkBox of checkBoxes) {
    const chkBoxId = checkBox.id;
    const rawId = chkBoxId.split(`check-${dispResourcePropName}--`)[1];
    let id = Number(rawId);
    if (refIdPropName && refDispPropName) {
      // オブジェクト型の場合
      id = rawId;
    }
    if (checkBox.checked) {
      //チェックされている項目のリソース配列でのインデックスを格納する
      checkedStatus.push(id);
    }
  }
  return checkedStatus;
}

/**
 * "ダイアログにある[data-dlg-prop]属性のついたinput要素に入力された値をcontextに反映する
 */
export function doCopyDialogInputToContext(dialogModel) {
  const dialogEle = dialogModel.element;
  const context = dialogModel.context;


  // ダイアログのうちバインディング（入力用コントロールと、入力値を格納するプロパティのひもづけ）が指定された要素を検索する
  const dlgPropInputEles = getAllSingleInputEles(dialogEle);

  {
    // 「適用」ボタンが押されたときのコールバック処理

    //単一選択の内容をcontextに反映する
    for (const dlgPropInputEle of dlgPropInputEles) {

      const value = getSingleValueOf(dlgPropInputEle);
      if (isTruthy(value) || typeOf(value) === 'Boolean') {
        // 入力コントロールの入力値がひもづけられるプロパティ名
        const dlgInputPropName = getInputPropertyName(dlgPropInputEle);
        context[dlgInputPropName] = value;
      }
    }

    //かたまりの複数選択（チェックボックス）の内容をcontextに反映する
    const dlgMultiPropHolderEles = getAllMultipleInputEles(dialogEle, { tag: 'div' });
    for (const dlgMultiPropHolderEle of dlgMultiPropHolderEles) {
      const multiPropName = dlgMultiPropHolderEle.getAttribute('data-dlg-multi-prop');
      context[multiPropName] = getMultiValuesOf(dlgMultiPropHolderEle);

    }
    //かたまりの複数選択（Input要素側）の内容をcontextに反映する

    // ここででてくるInput要素は変更をしない（なぜなら、チェックぼっくなどで編集された結果を表示するだけのinputboxなので)
    //ので特段手を加える必要がないのでなにもしない
    //const dlgMultiPropInputEles = dialogEle.querySelectorAll('input[data-dlg-multi-prop]');
    // DO NOTHING


  }

}

/**
 * 入力Elementから値を取得し指定された型変換を施した結果を返す
 * @param dlgInputEle
 */
function getTypedValue(dlgInputEle) {
  // 入力値の型
  const inputPropertyType = getInputPropertyType(dlgInputEle);

  const rawValue = dlgInputEle.value;
  if (inputPropertyType === 'text' && typeOf(rawValue) === 'String') {
    return rawValue;
  } else if (inputPropertyType === 'boolean' && typeOf(rawValue) === 'String') {
    //checkboxの処理
    return dlgInputEle.checked;
  } else if (inputPropertyType === 'number' && isTruthy(rawValue)) {
    return Number(rawValue);
  } else if (inputPropertyType === 'datetime' || inputPropertyType === 'date' || inputPropertyType === 'time') {
    return doPopulateDatePickerToContext(dlgInputEle);
  } else {
    throw Error(`Unknown type:${inputPropertyType} rawValue:${rawValue} typeOf(rawValue):${typeOf(rawValue)}`);
  }
}
