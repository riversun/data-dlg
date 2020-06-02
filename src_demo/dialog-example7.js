export default async function createDialog(dialogMgr, opt) {
  const userNameData = {
    userFirstName: null,
    userLastName: '',
    userMiddleName: null,
  }
  await dialogMgr.createDialog({
    id: 'dlg-example7',
    url: 'view/dlg-example7-control-auto-focus.html',
    onCreate: (data) => {
      const dialogModel = data.dialog;
      const opener = dialogModel.opener;
      dialogModel.context = {};
      dialogMgr.bindModelToContext(
        userNameData, dialogModel.context);
    },
    onApply: (data) => {
      const dialogModel = data.dialog;
      const opener = dialogModel.opener;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      dialogMgr.bindModelFromContext(
        userNameData, data.dialog.context);
      dialogInstance.hide();
    },
    onCancel: (data) => {
      const dialogModel = data.dialog;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      dialogInstance.hide();
    },
  });
}
