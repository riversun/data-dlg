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
 *
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

  // DIV要素以下に複数選択可能なcheckbox群のキャプション情報として
  // data-dlg-ref属性で指定されたリソース名で取得する
  // handle <div class="form-group" data-dlg-ref="prefectures"> eles for generating checkboxes
  const checkboxesParentEles = getAllDataRefEles(dialogEle, { tag: '.form-group' });
  for (const checkboxesParentEle of checkboxesParentEles) {
    const dispResourcePropName = getDataRefPropName(checkboxesParentEle);
    const dispData = getListingInputDispDataMap(dialogModel, checkboxesParentEle, { i18res });
    let html = '';
    for (const [id, dispText] of dispData.entries()) {
      html += `<!-- -->
<div class="custom-control custom-checkbox custom-pad">
    <input type="checkbox" class="custom-control-input" id="check-${dispResourcePropName}--${id}" >
    <label class="custom-control-label" for="check-${dispResourcePropName}--${id}">${dispText}</label>
</div>`;
    }
    checkboxesParentEle.innerHTML = html;
  }
}
