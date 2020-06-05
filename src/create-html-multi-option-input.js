import {
  getDataRefPropName,
  getAllDataRefEles,
} from './data-api-resolver';
import getListingInputDispDataMap from './view-data-resolver';

/**
 * data-dlg-ref属性に指定されたリソース名から
 * 複数の選択肢表示（単一選択、複数選択肢）用のラベルとして取得し
 * SELECTのoptionまたは複数のcheckbox要素を生成する
 * @param dialogModel
 * @author Tom Misawa <riversun.org@gmail.com> (https://github.com/riversun)
 *
 */
export default function doHandleChoiceEles(dialogModel, opt) {
  const dialogEle = dialogModel.element;

  const { i18res } = opt;

  // SELECT要素のoptionに設定する文字列一覧を、data-dlg-ref属性で指定されたリソース名で取得する
  const selectEles = getAllDataRefEles(dialogEle, { tag: 'select' });

  for (const selectEle of selectEles) {
    const dispData = getListingInputDispDataMap(dialogModel, selectEle, { i18res });
    let html = '';
    for (const [id, dispText] of dispData.entries()) {
      html += `<option value="${id}">${dispText}</option>`;
    }
    selectEle.innerHTML = html;
  }

  // select要素以外でdata-dlg-ref属性が指定されている要素のハンドリングをする
  // 具体的には、複数選択の場合には checkbox 単一選択の場合には radioを用いる
  // checkboxやradioをホールドする親となるDIV要素以下に複数選択可能なcheckbox,radio群のキャプション情報として
  // data-dlg-ref属性で指定されたリソース名で取得する
  // handle <div class="form-group" data-dlg-ref="prefectures"> eles for generating checkboxes
  const checkboxesParentEles = getAllDataRefEles(dialogEle, { tag: '.form-group' });

  for (const listSelectionParentEle of checkboxesParentEles) {
    const singleProp = listSelectionParentEle.getAttribute('data-dlg-prop');
    const multiProp = listSelectionParentEle.getAttribute('data-dlg-multi-prop');

    if (multiProp) {
      // 複数選択なのでチェックボックスを生成
      const dispResourcePropName = getDataRefPropName(listSelectionParentEle);
      const dispData = getListingInputDispDataMap(dialogModel, listSelectionParentEle, { i18res });
      let html = '';
      for (const [id, dispText] of dispData.entries()) {
        html += `<!-- -->
<div class="custom-control custom-checkbox custom-pad">
    <input type="checkbox" class="custom-control-input" id="check-${dispResourcePropName}--${id}" >
    <label class="custom-control-label" for="check-${dispResourcePropName}--${id}">${dispText}</label>
</div>`;
      }
      listSelectionParentEle.innerHTML = html;
    }
    if (singleProp) {
      // 単一選択なのでラジオボタン生成
      const dispResourcePropName = getDataRefPropName(listSelectionParentEle);
      const dispData = getListingInputDispDataMap(dialogModel, listSelectionParentEle, { i18res });
      let html = '';
      for (const [id, dispText] of dispData.entries()) {
        html += `<!-- -->
<div class="form-check custom-radio-button">
                <input class="form-check-input" type="radio" name="${dispResourcePropName}" id="radio-${dispResourcePropName}--${id}">
                <label class="form-check-label" for="radio-${dispResourcePropName}--${id}">${dispText}</label>
            </div>
`;
      }
      listSelectionParentEle.innerHTML = html;
    }
  }
}
