export default async function createDialog(dialogMgr, opt) {

  // 複数選択チェックボックスを、i18nリソースを参照して表示するデモ
  // Setup condition input dialog
  await dialogMgr.createDialog({
    id: 'dlg-example-1-1',
    //template: TEMPLATE_DIALOG_INPUT_CONDITION,
    url: 'view/dlg-example1-1-multi-selection-inputs.html',
    onCreate: (data) => {
      const dialogModel = data.dialog;
      //const mgr = dialogModel.dialogManager;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const context = dialogModel.context;//ダイアログの入力状態
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
    },
    onApply: (data) => {

      const dialogModel = data.dialog;
      //const mgr = dialogModel.dialogManager;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const context = dialogModel.context;//ダイアログの入力状態
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

      dialogInstance.hide();

    },
    onCancel: (data) => {
      const dialogModel = data.dialog;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      dialogInstance.hide();
    },
  });
}
