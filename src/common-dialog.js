import mergeDeeply from 'merge-deeply';
import { typeOf } from './common-utils';
import EventListenerHelper from "event-listener-helper";

const COMMON_DIALOG_TEMPLATE = `<!-- -->
<div class="modal-header">
    <h5 class="modal-title">#{data-dlg-common-confirmation-title}</h5>
    <button type="button" class="close" data-dlg-action="cancel" data-dlg-hidden="hasClose" >
        <span>&times;</span>
    </button>
</div>
<div class="modal-body">
        <label class="col-form-label">#{data-dlg-common-confirmation-message}</label>
</div>
<div class="modal-footer">
    <button type="button" class="btn #{data-dlg-common-confirmation-class-positive}" data-dlg-hidden="isPositive" data-dlg-action="apply">#{data-dlg-common-confirmation-label-positive}</button>
    <button type="button" class="btn #{data-dlg-common-confirmation-class-negative}" data-dlg-hidden="isNegative" data-dlg-action="cancel">#{data-dlg-common-confirmation-label-negative}</button>
    <button type="button" class="btn #{data-dlg-common-confirmation-class-neutral}" data-dlg-hidden="isNeutral" data-dlg-action="neutral">#{data-dlg-common-confirmation-label-neutral}</button>
</div>
`;
export default class CommonConfirmationDialog {
  constructor(dialogMgr) {
    this.dialogMgr = dialogMgr;

    // コモンダイアログのプール数
    //(コモンダイアログからコモンダイアログを開く場合1だとうまく動作しないため)
    this.numOfDialogPool = 2;
    this.crrDialogNumber = 0;

    this.positiveListener = () => {
    };
    this.negativeListener = () => {
    };
    this.neutralListener = () => {
    };

    this.opt = null;
    this.evh = new EventListenerHelper();
  }

  async showConfirmation(opt) {
    this.crrDialogNumber += 1;
    if (this.crrDialogNumber > this.numOfDialogPool - 1) {
      this.crrDialogNumber = 0;
    }
    this.opt = { type: 'yesno', res: {}, class: {} };
    mergeDeeply({ op: 'overwrite-merge', object1: this.opt, object2: opt });

    let titleDisp = '';
    if (this.opt.title) {
      const { title } = this.opt;
      const { res } = title;
      const { model } = title;
      if (res) {
        titleDisp = this.dialogMgr.t(res, model);
      } else {
        titleDisp = title;
      }
    }

    let messageDisp = '';
    if (this.opt.message) {
      const { message } = this.opt;
      const { res } = message;
      const { model } = message;
      if (res) {
        messageDisp = this.dialogMgr.t(res, model);
      } else {
        messageDisp = message;
      }
    }
    await this.init();
    await this.dialogMgr.showDialog(`data-dlg-common-confirmation${this.crrDialogNumber}`, {
      params: {
        title: titleDisp, // this.opt.title || this.dialogMgr.t(this.opt.res.title),
        message: messageDisp, // this.opt.message || this.dialogMgr.t(this.opt.res.message),
      },
    });
    return new Promise((resolve) => {
      this.setOnPositiveListener(() => {
        resolve('positive');
      });
      this.setOnNegativeListener(() => {
        resolve('negative');
      });
      this.setOnNeutralListener(() => {
        resolve('neutral');
      });
    });
  }


  onDialogCreate(data) {
    const { type } = this.opt;
    const context = {
      'data-dlg-common-confirmation-title': data.dialog.params.title,
      'data-dlg-common-confirmation-message': data.dialog.params.message,
    };

    if (type === 'yesno') {
      const localContext = {
        isPositive: true,
        isNegative: true,
        isNeutral: false,
        hasClose: true,
        'data-dlg-common-confirmation-label-positive': this.dialogMgr.t('common-yes'),
        'data-dlg-common-confirmation-label-negative': this.dialogMgr.t('common-no'),
        'data-dlg-common-confirmation-label-neutral': null,
        'data-dlg-common-confirmation-class-positive': 'btn-primary',
        'data-dlg-common-confirmation-class-negative': 'btn-secondary',
        'data-dlg-common-confirmation-class-neutral': 'btn-secondary',
      };
      mergeDeeply({ op: 'overwrite-merge', object1: context, object2: localContext });
    } else if (type === 'okcancel') {
      const localContext = {
        isPositive: true,
        isNegative: true,
        isNeutral: false,
        hasClose: true,
        'data-dlg-common-confirmation-label-positive': this.dialogMgr.t('common-ok'),
        'data-dlg-common-confirmation-label-negative': this.dialogMgr.t('common-cancel'),
        'data-dlg-common-confirmation-label-neutral': null,
        'data-dlg-common-confirmation-class-positive': 'btn-primary',
        'data-dlg-common-confirmation-class-negative': 'btn-secondary',
        'data-dlg-common-confirmation-class-neutral': 'btn-secondary',
      };
      mergeDeeply({ op: 'overwrite-merge', object1: context, object2: localContext });
    } else if (type === 'ok') {
      const localContext = {
        isPositive: true,
        isNegative: false,
        isNeutral: false,
        hasClose: false,
        'data-dlg-common-confirmation-label-positive': this.dialogMgr.t('common-ok'),
        'data-dlg-common-confirmation-label-negative': this.dialogMgr.t('common-cancel'),
        'data-dlg-common-confirmation-class-positive': 'btn-primary',
        'data-dlg-common-confirmation-class-negative': 'btn-secondary',
        'data-dlg-common-confirmation-class-neutral': 'btn-secondary',
      };
      mergeDeeply({ op: 'overwrite-merge', object1: context, object2: localContext });
    }

    const mapBoolean = (optProp, contextProp) => {
      if (typeOf(this.opt[optProp]) === 'Boolean') {
        context[contextProp] = this.opt[optProp];
      }
    };
    mapBoolean('positive', 'isPositive');
    mapBoolean('negative', 'isNegative');
    mapBoolean('neutral', 'isNeutral');

    const mapRes = (optRes, contextRes) => {
      if (this.opt.res[optRes]) {
        context[contextRes] = this.dialogMgr.t(this.opt.res[optRes]);
      }
    };
    mapRes('positive', 'data-dlg-common-confirmation-label-positive');
    mapRes('negative', 'data-dlg-common-confirmation-label-negative');
    mapRes('neutral', 'data-dlg-common-confirmation-label-neutral');

    const mapClass = (optClass, contextClass) => {
      if (this.opt.class[optClass]) {
        context[contextClass] = this.opt.class[optClass];
      }
    };

    mapClass('positive', 'data-dlg-common-confirmation-class-positive');
    mapClass('negative', 'data-dlg-common-confirmation-class-negative');
    mapClass('neutral', 'data-dlg-common-confirmation-class-neutral');


    data.dialog.context = context;
  }

  /**
   * dialogManager#createDialogで指定した、onApplyのデフォルトコールバック関数
   * 外部から登録されたpositiveListenerを呼び出す
   * @param data
   * @returns {Promise<void>}
   */
  async onDialogApply(data) {
    // return new Promise((resolve, reject) => {
    //     const dialogModel = data.dialog;
    //     const dialogInstance = dialogModel.instance;
    //
    //     const element = dialogModel.element;
    //     this.evh.addEventListener(element, 'hidden.bs.modal', async () => {
    //       // ダイアログが完全に非表示になった
    //       // 完全に非表示になってから、apply処理を終えることで、
    //       // 次にすぐcommonDiaogが呼び出されても動作するようにする。
    //       // （もし完全に非表示になる前に次のshowをよんでも、ダイアログは表示されないため)
    //       await this.positiveListener();
    //       setTimeout(() => {
    //         resolve();
    //       }, 100);
    //     }, { listenerName: 'common-dialog-click-apply', once: true });// once:trueでlistenerは1回限りで消える
    //     dialogInstance.hide();
    //   }
    // );
    const dialogModel = data.dialog;
    const dialogInstance = dialogModel.instance;
    dialogInstance.hide();
    await this.positiveListener();
  }

  /**
   * dialogManager#createDialogで指定した、onCancelのデフォルトコールバック関数
   * 外部から登録されたnegativeListenerを呼び出す
   * @param data
   * @returns {Promise<void>}
   */
  async onDialogCancel(data) {
    const dialogModel = data.dialog;
    const dialogInstance = dialogModel.instance;
    dialogInstance.hide();
    await this.negativeListener();
  }

  /**
   * dialogManager#createDialogで指定した、onAnyのデフォルトコールバック関数
   * 外部から登録されたneutralListenerを呼び出す
   * @param data
   * @returns {Promise<void>}
   */
  async onDialogAny(data) {
    const dialogModel = data.dialog;
    const dialogInstance = dialogModel.instance;
    dialogInstance.hide();
    await this.neutralListener();
  }

  /**
   * 外部から登録されたpositiveListenerを呼び出す
   * @returns {Promise<void>}
   */
  async onPositive() {
    if (this.positiveListener) {
      await this.positiveListener();
    }
  }

  /**
   * 外部から登録されたnegativeListenerを呼び出す
   * @returns {Promise<void>}
   */
  async onNegative() {
    if (this.negativeListener) {
      await this.negativeListener();
    }
  }

  /**
   * 外部から登録されたneutralListenerを呼び出す
   * @returns {Promise<void>}
   */
  async onNeutral() {
    if (this.neutralListener) {
      await this.neutralListener();
    }
  }


  async init() {
    if (this.dialogMgr.getDialogModelById(`data-dlg-common-confirmation${this.crrDialogNumber}`)) {
      return 'success';
    }
    await this.dialogMgr.createDialog({
      id: `data-dlg-common-confirmation${this.crrDialogNumber}`,
      template: COMMON_DIALOG_TEMPLATE,
      onCreate: this.onDialogCreate.bind(this),
      onApply: this.onDialogApply.bind(this),
      onCancel: this.onDialogCancel.bind(this),
      onAny: this.onDialogAny.bind(this),
    });
    return 'success';
  }

  setOnPositiveListener(listener) {
    if (listener) {
      this.positiveListener = listener;
    }
  }

  setOnNegativeListener(listener) {
    if (listener) {
      this.negativeListener = listener;
    }
  }

  setOnNeutralListener(listener) {
    if (listener) {
      this.neutralListener = listener;
    }
  }
}
