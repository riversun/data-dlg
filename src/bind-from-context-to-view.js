import { isTruthy, typeOf, unescapeHTML } from './common-utils';
import {
  getInputPropertyName,
  getInputPropertyType,
  getMutiInputPropertyName,
  getAllSingleInputEles,
  getAllMultipleInputEles,
} from './data-api-resolver';
import doPopulateContextToDatePicker from './bind-from-context-to-view-datepicker';
import getListingInputDispDataMap from './view-data-resolver';

/**
 * 1つの選択候補の表示文字列を取得する
 * @param dlgPropInputEle
 * @param rawValue
 * @returns {*}
 * @author Tom Misawa <riversun.org@gmail.com> (https://github.com/riversun)
 */
export function getSingleDispOf(dlgPropInputEle, rawValue) {
  // 入力コントロールの入力値がひもづけられるプロパティ名
  const dlgInputPropName = getInputPropertyName(dlgPropInputEle);
  const inputPropertyType = getInputPropertyType(dlgPropInputEle);

  if (dlgPropInputEle.tagName.toLowerCase() === 'input' || dlgPropInputEle.tagName.toLowerCase() === 'select') {
    if (dlgInputPropName) {
      if (inputPropertyType === 'text' || inputPropertyType === 'number') {
        if (isTruthy(rawValue)) {
          if (Array.isArray(rawValue)) {
            throw Error(`"${rawValue} should not be an array with 'data-dlg-multi-prop' attribute.`);
          }
          // contextに値がセットされていたら
          // 入力elementに初期値をセットする
          return unescapeHTML(rawValue);
        }
        return '';
        // throw Error(`${dlgInputPropName} ${rawValue} seems to be falsy`);
      }
      throw Error(`Invalid property type ${inputPropertyType}. text or number can be supported.`);
    }
    throw Error(`The element ${dlgPropInputEle} doesn't have a property name attribute.`);
  }
  throw Error(`Not currently supported element "${dlgPropInputEle.tagName}" as dialog input element.`);
}

/**
 * contextにある値をダイアログにある[data-dlg-prop]属性のついたinput要素の値として表示する
 * @param dialogModel
 */
export function doShowContextToDialogInput(dialogModel, opt) {
  const dialogEle = dialogModel.element;
  const { context } = dialogModel;

  // data-dlg-propのハンドリング
  // ダイアログのうちバインディング（入力用コントロールと、入力値を格納するプロパティのひもづけ）が指定された要素を検索する
  const dlgPropInputEles = getAllSingleInputEles(dialogEle);

  for (const dlgPropInputEle of dlgPropInputEles) {
    // 入力コントロールの入力値がひもづけられるプロパティ名
    const dlgInputPropName = getInputPropertyName(dlgPropInputEle);

    if (dlgPropInputEle.tagName === 'DIV') {
      // ラジオボタンの親要素だった場合
      const inputValue = context[dlgInputPropName];
      if (inputValue) {
        const id = inputValue;

        const dispResourcePropName = dlgPropInputEle.getAttribute('data-dlg-ref');
        const checkBoxId = `radio-${dispResourcePropName}--${id}`;
        const checkBox = dialogEle.querySelector(`#${checkBoxId}`);
        checkBox.checked = true;
      }
    } else {
      // ラジオボタンじゃない単一選択要素

      const inputPropertyType = getInputPropertyType(dlgPropInputEle);

      if (inputPropertyType === 'text' || inputPropertyType === 'number') {
        const inputValue = context[dlgInputPropName];
        dlgPropInputEle.value = getSingleDispOf(dlgPropInputEle, inputValue);
      } else if (inputPropertyType === 'boolean') {
        if (dlgPropInputEle.tagName.toLowerCase() === 'input' && dlgPropInputEle.type === 'checkbox') {
          const inputValue = context[dlgInputPropName];

          if (typeOf(inputValue) === 'Boolean') {
            if (inputValue === true) {
              dlgPropInputEle.checked = true;
            } else if (inputValue === false) {
              dlgPropInputEle.checked = false;
            }
          }
        }
      } else if (inputPropertyType === 'datetime' || inputPropertyType === 'date' || inputPropertyType === 'time') {
        if (dlgPropInputEle.tagName.toLowerCase() === 'input'
          || dlgPropInputEle.tagName.toLowerCase() === 'select'
        ) {
          if (dlgInputPropName) {
            doPopulateContextToDatePicker(dialogModel, opt);
          }
        } else {
          throw Error(`Not currently supported element "${dlgPropInputEle.tagName}" as dialog input element.`);
        }
      } else {
        throw Error(`Unknown inputPropertyType:${inputPropertyType} for property ${dlgInputPropName}`);
      }
    }
  }
}

/**
 * contextにある値をダイアログにある[data-dlg-multi-prop]属性のついたinput要素の値として表示する
 * @param dialogModel
 */
export function doShowMultiPropContextToDialogInput(dialogModel, opt) {
  const dialogEle = dialogModel.element;
  const { context } = dialogModel;
  const { i18res } = opt;

  // data-dlg-multi-prop
  // ダイアログのうちバインディング（入力用コントロールと、入力値を格納するプロパティのひもづけ）が指定された要素を検索する
  const dlgPropMultiInputEles = getAllMultipleInputEles(dialogEle);

  for (const dlgPropMultiInputEle of dlgPropMultiInputEles) {
    if (dlgPropMultiInputEle.tagName.toLowerCase() === 'input') {
      // 複数選択の結果をinput要素に「選択肢１,選択肢2,選択肢3」のように反映する

      // 入力コントロールの入力値がひもづけられるプロパティ名
      const dlgMultiInputPropName = getMutiInputPropertyName(dlgPropMultiInputEle);
      if (dlgMultiInputPropName) {
        const inputValue = context[dlgMultiInputPropName];
        if (isTruthy(inputValue)) {
          if (Array.isArray(inputValue)) {
            const dispData = getListingInputDispDataMap(dialogModel, dlgPropMultiInputEle, { i18res });
            let dispText = '';
            for (let i = 0; i < inputValue.length; i += 1) {
              const DELIMITER = ',';
              const id = inputValue[i];
              const dispStr = dispData.get(id);
              dispText += dispStr;
              if (i < inputValue.length - 1) {
                dispText += DELIMITER;
              }
            }
            dlgPropMultiInputEle.value = unescapeHTML(dispText);
          }
          // throw Error(`"${inputValue} should be an array with 'data-dlg-multi-prop' attribute.`);
        }
        //  Error(`${dlgMultiInputPropName} seems empty. value=${inputValue}`);
      }
    } else if (dlgPropMultiInputEle.tagName.toLowerCase() === 'div') {
      // 複数選択の結果をチェックボックスのチェック状態に反映する

      // 入力コントロールの入力値がひもづけられるプロパティ名
      const dlgMultiInputPropName = getMutiInputPropertyName(dlgPropMultiInputEle);

      if (dlgMultiInputPropName) {
        const inputValue = context[dlgMultiInputPropName];

        if (isTruthy(inputValue)) {
          if (Array.isArray(inputValue)) {
            const multiValues = inputValue;
            // 表示用データ（複数）のプロパティ名
            const dispResourcePropName = dlgPropMultiInputEle.getAttribute('data-dlg-ref');
            for (let i = 0; i < multiValues.length; i += 1) {
              // selectedKeyは単純配列の場合は通常の配列添字、
              // オブジェクトが格納された配列の場合はオブジェクトのidを意味するプロパティkey となる
              const id = multiValues[i];
              const checkBoxId = `check-${dispResourcePropName}--${id}`;
              const checkBox = dialogEle.querySelector(`#${checkBoxId}`);
              checkBox.checked = true;
            }
          } else {
            throw Error(`"${inputValue} should be an array with 'data-dlg-multi-prop' attribute.`);
          }
        }
      }
    } else {
      // console.log(`Not currently supported element "${dlgPropMultiInputEle.tagName}" as multi-prop dialog input element.`);
    }
  }
}
