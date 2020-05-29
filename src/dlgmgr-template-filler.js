import { isTruthy, typeOf } from './common-utils';

/**
 * @author Tom Misawa <riversun.org@gmail.com> (https://github.com/riversun)
 */
export default class DlgmgrTemplateFiller {
  constructor(opt) {
    this.i18res = opt ? opt.i18res : null;
    // Regexp for extracting all enclosed placeholder(like #{something}) in the text
    this.REGEXP_4_ALL_PLACEHOLDERS = /#{([\s\S]*?)}/g;

    // Regexp for extracting internal contents of placeholder(like #{something}) in the text
    this.REGEXP_4_PLACEHOLDER_CONTENT = /#{([\s\S]*?)}/;
  }

  /**
   * Populate values in the model into templateText
   * @param template text contains place holder like "#{keyname}"
   * @param model set of value with key like "{'keyname':'value'}"
   * @returns {*} populatedText
   */
  populateModelIntoTemplate(template, model) {
    const populatedText = template.replace(this.REGEXP_4_ALL_PLACEHOLDERS, (match) => {
      // Get the contents enclosed with #{}

      const propertyName = match.match(this.REGEXP_4_PLACEHOLDER_CONTENT)[1];

      const replacementFromModel = isTruthy(model) ? model[propertyName] : '';
      let replacementValueFromModel = null;
      let replacementValueFromI18res = null;
      // property context for i18res
      let replacementContextForI18res = null;

      if (typeOf(replacementFromModel) === 'Object') {
        // オブジェクト{}が指定されていた場合
        replacementValueFromModel = replacementFromModel.value;
        replacementContextForI18res = replacementFromModel.model;
        if (this.i18res && replacementFromModel.res) { // modelにres(i18resのリソースid)が指定されていた場合
          replacementValueFromI18res = this.i18res.t(replacementFromModel.res, replacementContextForI18res);
        }
      } else if (typeOf(replacementFromModel) === 'String' || typeOf(replacementFromModel) === 'Number') {
        replacementValueFromModel = replacementFromModel;
      }

      if (this.i18res && !replacementValueFromI18res) {
        replacementValueFromI18res = this.i18res.t(propertyName, replacementContextForI18res);
      }

      let replacementStr;
      if (isTruthy(replacementValueFromModel)) {
        replacementStr = replacementValueFromModel;
      } else if (isTruthy(replacementValueFromI18res)) {
        replacementStr = replacementValueFromI18res;
      } else {
        replacementStr = '';
      }
      return replacementStr;
    });
    return populatedText;
  }
}
