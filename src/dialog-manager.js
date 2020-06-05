import './scss/dialog-manager.scss';
import EventListenerHelper from 'event-listener-helper';
import mergeDeeply from 'merge-deeply';
import { AjaxClient } from 'ajax-client';
import I18nice from 'i18nice';
import {
  isNotUndefined,
  isTruthy, isFalsy, typeOf,
} from './common-utils';
import DlgmgrTemplateFiller from './dlgmgr-template-filler';
import { doCopyDialogInputToContext } from './bind-from-view-to-context';
import { doShowContextToDialogInput, doShowMultiPropContextToDialogInput } from './bind-from-context-to-view';
import doHandleChoiceEles from './create-html-multi-option-input';
import CommonConfirmationDialog from './common-dialog';


/**
 * bsn(bootstrap.native)+bootstrap4環境において、
 * html要素への属性付与によりダイアログ表示・非表示やプロパティのバインディングを極力ノンコードで行うユーティリティ
 *
 * 【使い方】
 ・data-dlg-action属性

 - data-dlg-action属性はダイアログに表示するボタン等クリックできる要素に付与する属性である。
 - data-dlg-action属性の値は"apply"と"cancel"が予約されている。（ほかの値も指定可能）
 --"apply"の動作
 以下の例のように"apply"が指定されたボタンをクリックした場合は"onApply"がコールバックされる。
 <button type="button" class="btn btn-primary" data-dlg-action="apply">#{label-save}</button>
 なお"apply"の際には、ダイアログにあるプロパティ入力用要素(data-dlg-prop属性のあるinput要素など)
 の値がcontextオブジェクトに自動的に保存される。
 --"cancel"の動作
 "cancel"が指定された場合は"onCancel"がコールバックされる。
 --他の値が指定された場合の動作
 "apply"と"cancel"以外の値がセットされたボタンがクリックされた場合は"onAny"がコールバックされる。

 * @author Tom Misawa <riversun.org@gmail.com> (https://github.com/riversun)
 */
export default class DialogManager {
  constructor() {
    this.dialogModels = new Map();
    this.evh = new EventListenerHelper();
    this.templateFill = new DlgmgrTemplateFiller();
    this.loadTemplateOnOpen = false;

    this.client = new AjaxClient();
    this.locale = 'en';
    this.i18res = new I18nice();
    this.i18res.setFallback('en');
    this.templateFill.i18res = this.i18res;
    this.dlgConfirmation = new CommonConfirmationDialog(this);
  }

  /**
   * 確認ダイアログを表示する
   * @param opt
   * @returns {Promise<unknown>}
   */
  async showConfirmation(opt) {
    const result = await this.dlgConfirmation.showConfirmation(opt);
    return result;
  }

  /**
   * 次にshowConrimationを呼び出すときに表示される確認ダイアログのdialogModelを取得する
   * （showConfirmationはawaitで使う前提なので、事前に次に表示される予定の確認ダイアログのdialogModelを取得できるようにしている）
   * @returns
   */
  getNextConfirmationDialogId() {
    return this.dlgConfirmation.getNextConfirmationDialogId();
  }


  /**
   * ダイアログ用のテンプレートHTMLをurlから読み込む設定にした場合、
   * ダイアログが開くタイミングでそれをよみこむか否かをセットする
   * ダイアログが開く前に事前に読み込んでおく場合は false
   * @param enalbed
   */
  setLoadTemplateOnOpen(enabled) {
    this.loadTemplateOnOpen = enabled;
  }

  /**
   * Bootstrap nativeをセットする
   * @param bsn
   */
  setBsn(bsn) {
    this.bsn = bsn;
  }

  /**
   * i18nリソースを取得する
   * @param sentenceId
   * @param opt
   * @returns {string|*}
   */
  t(sentenceId, opt) {
    return this.i18res.t(sentenceId, opt);
  }

  async setResourcesWithModel(model) {
    const defaultResource = {
      en: {
        'common-yes': 'Yes',
        'common-no': 'No',
        'common-ok': 'OK',
        'common-cancel': 'Cancel',
        'common-apply': 'Apply',
        'common-help': 'Help',
      },
      ja: {
        'common-yes': 'はい',
        'common-no': 'いいえ',
        'common-ok': 'OK',
        'common-cancel': 'キャンセル',
        'common-apply': '適用',
        'common-help': 'ヘルプ',
      },
    };

    mergeDeeply({ op: 'overwrite-merge', object1: model, object2: defaultResource });
    this.i18res.init(model);
    return 'success';
  }

  /**
   * 非同期
   * @param url
   * @returns {Promise<unknown>}
   */
  async setResourcesFromUrl(url) {
    const model = await this.loadResourceFromUrl(url, 'json', 'setResourcesFromUrl');
    await this.setResourcesWithModel(model);
    return 'success';
  }

  setLocale(locale) {
    this.locale = locale;
    this.i18res.setLocale(locale);
  }

  /**
   * modelにあるプロパティをダイアログのcontextにを書き込む
   * @param dialogId
   * @param model
   * @param keys 書きこみするプロパティ名（無指定ならmodelにあるすべてのプロパティを書き込む)
   */
  bindModelToContext(model, context, keys) {
    for (const key of Object.keys(model)) {
      if (!keys || keys.includes(key)) {
        context[key] = model[key];
      }
    }
  }

  /**
   * contextにあるプロパティのうちmodelにあるプロパティ名と同名のプロパティがあったらmodelに書き込む
   * ただし、keysでプロパティ名が具体的に指定されている場合はmodelに存在しないプロパティ名でもcontextからmodelにコピーする
   * contextにあるプロパティの値がnullだった場合は、modelにコピーされる。undefinedだった場合はコピーされない。
   * @param dialogId
   * @param model
   * @param keys コピーしたいキー
   */
  bindModelFromContext(model, context, keys) {
    if (keys) {
      // context->modelにコピーしたいキーが指定されている場合
      for (const key of Object.keys(context)) {
        if (keys.includes(key)) {
          // if (isTruthy(context[key]) || typeOf(context[key]) === 'Boolean') {
          if (isNotUndefined(context[key]) || typeOf(context[key]) === 'Boolean') {
            model[key] = context[key];
          }
        }
      }
    } else {
      // context->modelにコピーしたいキーが指定されていない場合
      for (const key of Object.keys(model)) {
        // if (isTruthy(context[key]) || typeOf(context[key]) === 'Boolean') {
        if (isNotUndefined(context[key]) || typeOf(context[key]) === 'Boolean') {
          model[key] = context[key];
        }
      }
    }
  }

  /**
   * モーダルダイアログを生成しDOMに追加する
   * @param dialogId
   * @param templateHTML
   * @param callbackObj
   */
  async createDialog(opt) {
    const dialogId = opt.id;
    const { template } = opt;
    const { url } = opt;

    const callbackStore = {
      onCreate: opt.onCreate,
      onShow: opt.onShow,
      onResume: opt.onResume,
      onApply: opt.onApply,
      onCancel: opt.onCancel,
      onAny: opt.onAny,
    };
    if (!template && !url) {
      throw Error('template or url property should be specified.');
    }
    let dialogElement = document.querySelector(`#${dialogId}`);
    if (!dialogElement) {
      const modalHtml = `
    <div class="modal fade" id="${dialogId}" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <!-- the .setContent() method will update this element's HTML -->
            </div>
        </div>
    </div>`;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      dialogElement = document.querySelector(`#${dialogId}`);

      const bsnModalDialogInstance = new this.bsn.Modal(dialogElement,
        {
          // content: templateHTML,
          backdrop: 'static', // we don't want to dismiss Modal when Modal or backdrop is the click event target
          keyboard: true, // true:close modal by pressing ESC
        });

      const htmlTemplateFromUrl = !this.loadTemplateOnOpen ? await this.loadResourceFromUrl(url, 'text', `htmlTemplateFromUrl:${url} for dialog:${dialogId}`) : null;


      const dialogModel = {
        id: dialogId, // dialog id which is same as dialog DOM element
        instance: bsnModalDialogInstance, // bootstrap.native's modal dialog instance
        element: dialogElement, // dialog DOM element
        // template: template ? template : htmlTemplateFromUrl,// template written in HTML text
        template: template || htmlTemplateFromUrl, // template written in HTML text
        url,
        callback: callbackStore, // dialog event listener
        context: null, // property values for template
        opener: null, // data of this dialog opener
        params: {}, // extra parameters for dialog handling
      };
      this.dialogModels.set(dialogId, dialogModel);
    } else {
      // console.log(`Dialog element you specified by id:"${dialogId}" has already been existed.`);

    }

    return '';
  }

  /**
   * 非同期
   * @param url
   * @param dataType
   * @returns {Promise<unknown>}
   */
  async loadResourceFromUrl(url, dataType, comment, timeoutMillis) {
    return new Promise((resolve, reject) => {
      if (isFalsy(url)) {
        resolve();
      }

      this.client.ajax({
        type: 'get',
        url,
        contentType: 'application/json',
        dataType,
        timeoutMillis: timeoutMillis || 5000, // timeout milli-seconds
        success: (response) => {
          // 1回ダウンロードしたらこのダイアログのテンプレートを記憶する
          resolve(response);
        },
        error: (e) => {
          reject(new Error(`Network error. while ${comment} error:${e}`));
        },
        timeout: (e) => {
          reject(new Error(`Network timeout error. while ${comment} error:${e}`));
        },
      });
    });
  }


  /**
   * 生成したダイアログを削除する
   * @param dialogId
   * @returns {boolean} true:success false:failure or no dialog found.
   */
  deleteDialog(dialogId) {
    const dialogModel = this.getDialogModelById(dialogId);
    if (dialogModel) {
      const dialogElement = dialogModel.element;
      // remove from dialogModel map
      this.dialogModels.delete(dialogId);
      // remove DOM element
      dialogElement.parentNode.removeChild(dialogElement);
      return true;
    }
    return false;
  }


  /**
   * dialogIdで(bsnの)ダイアログインスタンスを取得する
   * @param dialogId
   * @returns {unknown}
   */
  getDialogModelById(dialogId) {
    return this.dialogModels.get(dialogId);
  }


  /**
   * onCancelを呼び出す
   * @param actionName
   * @param dialogModel
   */
  async doCallbackCancel(actionName, dialogModel) {
    const callbacks = dialogModel.callback;
    if (callbacks.onCancel) {
      await callbacks.onCancel({ action: actionName, dialog: dialogModel });
    }
  }

  /**
   * onAnyを呼び出す
   * @param actionName
   * @param dialogModel
   */
  doCallbackAny(actionName, dialogModel) {
    const callbacks = dialogModel.callback;
    if (callbacks.onAny) {
      callbacks.onAny({ action: actionName, dialog: dialogModel });
    }
  }


  /**
   * 属性に[data-dlg-action]が指定されたアクションボタン（「適用」「更新」など）に
   * 自動的にクリックイベントをセットする
   * @param dialogModel
   */
  setEventsToActionButtons(dialogModel) {
    const dialogEle = dialogModel.element;
    const dialogId = dialogModel.id;
    const callbacks = dialogModel.callback;
    // 「save」ボタン等のイベントをセットする
    const dlgActionEles = dialogEle.querySelectorAll('[data-dlg-action]');
    if (dlgActionEles) {
      // ダイアログ内にあるアクション（登録をするための)ボタンを検索する
      for (const dlgActionEle of dlgActionEles) {
        const actionName = dlgActionEle.getAttribute('data-dlg-action');

        if (actionName === 'apply') {
          // アクションが「apply」だった場合
          this.evh.addEventListener(dlgActionEle, 'click', async () => {
            doCopyDialogInputToContext(dialogModel);
            if (callbacks.onApply) {
              // コールバック
              await callbacks.onApply({ action: 'apply', dialog: dialogModel });
            }
          }, { listenerName: `click-listener-for-apply-dlg-${dialogId}` });
        } else if (actionName === 'cancel') {
          this.evh.addEventListener(dlgActionEle, 'click', async () => {
            await this.doCallbackCancel(actionName, dialogModel);
          }, { listenerName: `click-listener-for-cancel-dlg-${dialogId}` });
        } else if (actionName) {
          this.evh.addEventListener(dlgActionEle, 'click', async () => {
            await this.doCallbackAny(actionName, dialogModel);
          }, { listenerName: `click-listener-for-${actionName}-dlg-${dialogId}` });
        }
      }
    }

    // 改行で適用効果をつけるinput要素
    const enterToApplyInputEle = dialogEle.querySelector('[data-dlg-enter-to-apply]');
    if (enterToApplyInputEle) {
      this.evh.addEventListener(enterToApplyInputEle, 'keypress', async (evt) => {
        if (evt.code === 'Enter' || evt.code === 'NumpadEnter') {
          doCopyDialogInputToContext(dialogModel);
          if (callbacks.onApply) {
            // コールバック
            await callbacks.onApply({ action: 'apply', dialog: dialogModel });
          }
        }
      });
    }
  }

  doHandleHiddenEles(dialogModel) {
    const dialogEle = dialogModel.element;
    const { context } = dialogModel;

    // あるcontextプロパティ値がセットされていない場合には隠す処理をする
    const dlgHiddenEles = dialogEle.querySelectorAll('[data-dlg-hidden]');
    if (dlgHiddenEles) {
      for (const dlgHiddenEle of dlgHiddenEles) {
        const propertyName = dlgHiddenEle.getAttribute('data-dlg-hidden');
        const hiddenEleValue = context[propertyName];
        if (isTruthy(hiddenEleValue) && hiddenEleValue !== '') {
          dlgHiddenEle.style.display = 'block';
        } else {
          dlgHiddenEle.style.display = 'none';
        }
      }
    }
  }


  /**
   * ダイアログを表示する
   * ・opener経由ではなく、手動でダイアログを表示する
   * ・showDialogでダイアログを表示すると、#createDialogで指定できる"onCreate"イベントが発火する
   * @param dialogId
   * @param opt
   */
  async showDialog(dialogId, opt) {
    // openerではなく手動でダイアログを表示する
    const safeOpt = opt || {};
    const dialogModel = this.getDialogModelById(dialogId);
    if (dialogModel) {
      mergeDeeply({ op: 'overwrite-merge', object1: dialogModel, object2: safeOpt });

      // _optがdialogModelにコピーできない問題がある場合の、workaround
      if (isTruthy(safeOpt.context) && isTruthy(dialogModel.context)) {
        mergeDeeply({ op: 'overwrite-merge', object1: dialogModel.context, object2: safeOpt.context });
      }

      await this.openDialogInternally(dialogModel);
      this.refreshDialog(dialogId);
    }
  }

  async openDialogInternally(dialogModel) {
    const callbacks = dialogModel.callback;
    if (callbacks.onCreate) {
      await callbacks.onCreate({ action: 'create', dialog: dialogModel });
    }
  }


  /**
   * ダイアログを（再）表示する
   * （非同期）
   * ・本メソッドの場合はonCreateイベントは発生せず、ダイアログのテンプレートに表示されるcontextなどは既に設定済のものが使われる
   * ・dialogModelに設定する追加データをセットすることは可能
   *
   * #showDialogと#refreshDialogの使い分け
   * ・ダイアログを新規に表示する場合はshowDialog
   * ・バリデーションエラーなどで、いま開いているダイアログの内容を更新する場合は#refreshDialog
   * @param dialogId
   * @param opt
   */
  refreshDialog(dialogId, opt) {
    // ダイアログを表示する
    const safeOpt = opt || {};
    const dialogModel = this.getDialogModelById(dialogId);

    if (dialogModel) {
      mergeDeeply({ op: 'overwrite-merge', object1: dialogModel, object2: safeOpt });
      // _optがdialogModelにコピーできない問題がある場合の、workaround
      if (isTruthy(safeOpt.context) && isTruthy(dialogModel.context)) {
        mergeDeeply({ op: 'overwrite-merge', object1: dialogModel.context, object2: safeOpt.context });
      }
      const dialogInstance = dialogModel.instance;
      const dialogTemplate = dialogModel.template;
      const dialogUrl = dialogModel.url;
      const { context } = dialogModel;

      if (isFalsy(context)) {
        throw Error(`dialogId:${dialogId} 's context is falsy. \nIsn't it possible to input/output using a dialog, even though the context is falsy:${context}?
If you want to do input and output, it's a good idea to set some context in #onCreate.
Or if you have an external dialog set to a value, are you giving it a "data-dlg-resume" attribute ?`);
      }

      if (dialogModel.params.resume) {
        // 他のダイアログからのresumeだった場合
        const resumeData = dialogModel.params.resume;
        // dialogModelからデータ削除
        dialogModel.params.resume = null;
        if (dialogModel.callback.onResume) {
          dialogModel.callback.onResume({ dialog: dialogModel, resume: resumeData });
        }
      }

      const fnShowDialog = async (templateHTML) => {
        // HTMLテンプレートに記載されたプレースホルダー#{}にデータを埋める

        // optionで直接"context"が指定されていたらそれを優先する
        const dataPopulatedHTML = this.templateFill.populateModelIntoTemplate(templateHTML, safeOpt.context ? safeOpt.context : context);
        dialogInstance.setContent(dataPopulatedHTML);// ここではじめてダイアログ内のコンテンツHTMLがセットされる


        const dialogEle = dialogModel.element;
        const dataDialogAttrs = dialogEle.querySelectorAll('[data-dlg]');
        if (dataDialogAttrs && dataDialogAttrs.length > 0) {
          // data-dlg属性（つまり別のダイアログを起動するための属性）がこのダイアログに指定されていた場合
          this.doSetupDataDialog(dialogEle, { resumeDialogId: dialogId });
        }

        // data-dlg-ref属性のあるSELECT要素に
        // 子要素のoption要素に自動的に入れる
        doHandleChoiceEles(dialogModel, { i18res: this.i18res });

        // あるcontextプロパティ値がセットされていない場合には隠す処理をする
        this.doHandleHiddenEles(dialogModel);

        // contextプロパティをダイアログにある[data-dlg-prop]属性のついたinput要素のvalueにセットする
        doShowContextToDialogInput(dialogModel, { locale: this.locale });

        // contextプロパティをダイアログにある[data-dlg-multi-prop]属性のついたinput要素のvalueにセットする
        doShowMultiPropContextToDialogInput(dialogModel, { i18res: this.i18res });

        // 「適用」などのアクションボタン等にクリックイベントを自動的にセットする
        this.setEventsToActionButtons(dialogModel);

        dialogInstance.show();

        if (dialogModel.callback.onShow) {
          await dialogModel.callback.onShow({ dialog: dialogModel });
        }

        // input要素へのフォーカス処理
        let focusEle = null;

        if (dialogModel.focusProperty) {
          // 強制フォーカス設定があれば
          if (dialogModel.focusProperty === 'none') {
            // noneが指定されていたら、どこにもオートフォーカスはしない
            // ただし１回で効力は切れる
            dialogModel.focusProperty = null;
          } else {
            focusEle = dialogEle.querySelector(`[data-dlg-prop=${dialogModel.focusProperty}]`);
            dialogModel.focusProperty = null;
          }
        } else {
          // 強制フォーカスの設定なければ
          // 指定されたinput要素へのフォーカス処理
          const focusEles = dialogEle.querySelectorAll('[data-dlg-focus]');

          for (const ele of focusEles) {
            let focusMode = ele.getAttribute('data-dlg-focus');

            if (focusMode === '') {
              // data-dlg-focus属性に属性値が設定されていない場合は
              // focus-if-emptyと同じ扱いとする
              focusMode = 'focus-if-empty';
            }

            if (focusMode === 'always') {
              // 常にフォーカスするモード
              focusEle = ele;
              break;
            } else if (focusMode === 'focus-if-empty') {
              // 値がカラ（empty）だったらフォーカスする
              if (ele.value === '') {
                focusEle = ele;
                break;
              }
            }
          }
        }
        if (focusEle) {
          setTimeout(() => {
            focusEle.focus();
          }, 500);
        }
      };

      if (dialogTemplate) {
        // optionで直接templateHTMLが指定されていたら、それを優先する
        const templateHTML = safeOpt.template ? safeOpt.template : dialogTemplate;

        setTimeout(async () => {
          await fnShowDialog(templateHTML);
        }, 0);
      } else if (dialogUrl) {
        // urlが指定されていた場合はurlからダイアログレンダリングhtmlを取得する

        this.client.ajax({
          type: 'get',
          url: dialogUrl,
          contentType: 'text/html',
          dataType: 'text', // data type to parse when receiving response from server
          timeoutMillis: 2500, // timeout milli-seconds
          success: async (response) => {
            // Once downloaded, remember template
            dialogModel.template = response;
            await fnShowDialog(response);
          },
          error: async (e) => {
            const resText = `Network Error occurred.Please reload the page.ネットワークエラーが発生しました、お手数ですがページリロードをおねがいします error=${e}`;
            // alert('Network Error occurred.Please reload the page.ネットワークエラーが発生しました、お手数ですがページリロードをおねがいします');
            dialogModel.template = resText;
            await fnShowDialog(resText);
            // throw e;
          },
          timeout: async (e) => {
            const resText = `Network Timeout Error occurred.Please reload the page.ネットワークタイムアウトエラーが発生しました、お手数ですがページリロードをおねがいします error=${e}`;
            dialogModel.template = resText;
            await fnShowDialog(resText);
          },
        });
      }
    }
  }


  /**
   * data-dlg属性のついた要素に自動的にダイアログを開くクリックイベントを設定する
   */
  activate() {
    this.evh.clearAllEventListeners();
    this.doSetupDataDialog(document);
  }

  /**
   * DATA-API経由でのダイアログ起動など
   * @param scopeEle
   * @param opt
   */
  doSetupDataDialog(scopeEle, opt) {
    // クリックすると自動的にダイアログを開く設定のElementを検索する。
    // ＝属性に'data-dlg'のある要素
    const dlgOpenerElements = scopeEle.querySelectorAll('[data-dlg]');
    for (const dlgOpenerEle of dlgOpenerElements) {
      // これから開くべきダイアログのid
      const openingDialogId = dlgOpenerEle.getAttribute('data-dlg');

      // このダイアログを開いたダイアログ(openerDialog)に戻りたいか否かを確認。トリガーになった要素(openerEle)の属性で指定してある
      const attrIsResume = dlgOpenerEle.getAttribute('data-dlg-resume');

      // このダイアログを開いたダイアログ(openerDialog)に戻りたいか否かのフラグ
      const wantToBackOpenerDialog = attrIsResume !== null && attrIsResume !== 'undefined'; // openerにはdata-dlgで開きたいダイアログを指定しているが、

      // openerがもともと別のダイアログ上にあった場合
      // eslint-disable-next-line no-irregular-whitespace
      //　新たなダイアログを開いた後に、元のダイアログに戻りたい（開きなおしたい）場合がある
      // その場合に optにresumeDialogIdを指定しておくと、
      // そのdialogIdのダイアログに「戻れる」
      const backToDialogId = opt ? opt.resumeDialogId : null;// 戻るべきダイアログのdialogId

      // 開き元のダイアログ(openerDialog)に戻りたいフラグとそのdialogIdが指定されていた場合、
      // 開き元のダイアログに戻る
      const needToBackOpenerDialog = wantToBackOpenerDialog && backToDialogId;


      // data-dlgで指定したダイアログidが存在したら、
      // dlgOpenerをクリックしたとき、そのダイアログを表示するようにする
      const openingDialogModel = this.getDialogModelById(openingDialogId);
      if (openingDialogModel) {
        // このダイアログを開くトリガーになった要素(openerEle)にクリックイベントリスナーをセットする
        this.evh.addEventListener(dlgOpenerEle, 'click', async () => {
          const openingDialogElement = openingDialogModel.element;
          const targetDialogDataKey = dlgOpenerEle.getAttribute('data-dlg-key');
          const opener = { element: dlgOpenerEle, key: targetDialogDataKey };
          openingDialogModel.opener = opener;

          const backToDialogModel = this.getDialogModelById(backToDialogId);
          if (needToBackOpenerDialog) {
            // もし、開き元のダイアログ(backToDialog)に戻るモードなら、開き元のダイアログのcontextを
            // これから開くダイアログ(openingDialog)にセットする

            // 新しいダイアログ(openingDialog)が開く前に、現在のダイアログ(backToDialog)の入力状態をcontextに反映しておく
            doCopyDialogInputToContext(backToDialogModel);

            // set whole context(copy context)
            openingDialogModel.context = backToDialogModel.context;
          }

          // data-dlgで指定されていたopeningDialogを開く
          await this.openDialogInternally(openingDialogModel);
          this.refreshDialog(openingDialogId);

          if (needToBackOpenerDialog) {
            // 開いた元のダイアログに戻る設定の場合
            // これから開くダイアログが閉じたときに元のダイアログを開く

            if (!this.evh.hasEventListener(openingDialogElement, 'hidden.bs.modal',
              `close-listener-for-resume-to-${opt.resumeDialogId}`)) {
              // openingDialogが閉じたときのイベントを登録
              this.evh.addEventListener(openingDialogElement, 'hidden.bs.modal', async () => {
                // 戻り先ダイアログに、いま開いていたダイアログのdialogModelを入れる
                backToDialogModel.params.resume = {
                  openerKey: targetDialogDataKey,
                  dialogModel: openingDialogModel,
                };
                backToDialogModel.focusProperty = 'none';

                // 元のダイアログを表示
                this.refreshDialog(opt.resumeDialogId);
              }, { listenerName: `close-listener-for-resume-to-${opt.resumeDialogId}` });
            }
          }
        }, { listenerName: `click-listener-for-open-dlg-${openingDialogId}` });
      }
    }
  }
}
