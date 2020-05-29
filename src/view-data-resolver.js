import { getDataRefPropName, getInputDataRefDispPropName, getInputDataRefIdPropName } from './data-api-resolver';
import { isFalsy } from './common-utils';

/**
 * 指定したtargetEle要素（複数の候補表示するselectやcheckboxの親となるdiv要素）の属性に従い
 * 候補となるデータ(idとdispTextの組み合わせ)ペアが格納されたMapを返す
 * @param targetEle
 * @param opt
 * @returns {Map<id, dispText>}
 * @author Tom Misawa <riversun.org@gmail.com> (https://github.com/riversun)
 */
export default function getListingInputDispDataMap(dialogModel, targetEle, opt) {
  const { context } = dialogModel;
  const { i18res } = opt;
  const result = new Map();

  // 参照先(i18resまたはcontext内の)のプロパティ名
  const dispResourcePropName = getDataRefPropName(targetEle);
  // 選択値(id)にするプロパティ名
  const refIdPropName = getInputDataRefIdPropName(targetEle);
  // 選択肢(dispText)の表示につかうプロパティ名
  const refDispPropName = getInputDataRefDispPropName(targetEle);
  const customSrc = context[dispResourcePropName];


  // i18resに格納されたプロパティ群
  const dispStringsFromI18Res = i18res.t(dispResourcePropName);
  // 自前で指定したプロパティ群
  const dispStringsFromContext = customSrc;
  const dispModels = dispStringsFromContext || dispStringsFromI18Res;

  if (dispModels) {
    if (Array.isArray(dispModels)) {
      for (let index = 0; index < dispModels.length; index += 1) {
        const dispObject = dispModels[index];
        let id = index;
        let dispText = dispObject;
        if (refIdPropName && refIdPropName) {
          id = dispObject[refIdPropName];
          dispText = dispObject[refDispPropName];
          if (isFalsy(dispText)) {
            throw Error(`${refDispPropName}'s resource not found.dispText:${dispText}`);
          }
        }
        result.set(id, dispText);
      }
      return result;
    }
    throw Error(`Disp data is not an array.data=${dispModels}`);
  }
  throw Error('Disp data not found.');
}
