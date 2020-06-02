export default async function createDialog(dialogMgr, opt) {


  const userNameData = {
    userFirstName: 'Tom',
    userLastName: '',
    userMiddleName: null,
  }


  await dialogMgr.createDialog({
    id: 'dlg-example7-1',
    url: 'view/dlg-example7-control-auto-focus.html',
    onCreate: (data) => {
      const dialogModel = data.dialog;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const openerElement = opener.element;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

      dialogModel.context = {};

      dialogMgr.bindModelToContext(
        userNameData, dialogModel.context);

    },
    onApply: (data) => {
      const dialogModel = data.dialog;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const context = dialogModel.context;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      const openerElement = opener.element;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

      dialogMgr.bindModelFromContext(
        userNameData, data.dialog.context);

      // ダイアログを閉じる
      dialogInstance.hide();

      console.log("編集終了");
      console.log(userNameData);

    },
    onCancel: (data) => {
      // ダイアログがキャンセルされたときに、呼び出される
      const dialogModel = data.dialog;
      //const mgr = dialogModel.dialogManager;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const context = dialogModel.context;//ダイアログの入力状態
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      dialogInstance.hide();
    },
  });
}
