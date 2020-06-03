export default async function createDialog(dialogMgr, opt) {

  const userData = opt.userData;

  return dialogMgr.createDialog({
    id: 'dlg-example8',
    url: 'view/dlg-example8-radio-single.html',
    onCreate: (data) => {
      const dialogModel = data.dialog;
      const opener = dialogModel.opener;
      dialogModel.context = {};
      const copyToPropNames = ['userDegree'];
      dialogMgr.bindModelToContext(
        userData, dialogModel.context, copyToPropNames);
    },
    onApply: (data) => {
      const dialogModel = data.dialog;
      const opener = dialogModel.opener;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素

      const copyToPropNames = ['userDegree'];
      dialogMgr.bindModelFromContext(
        userData, data.dialog.context, copyToPropNames);

      dialogInstance.hide();

      //選択したデータで元のセルの内容を更新
      if (openerElement) {
        openerElement.value = '';
        // 内部でよければgetListingInputDispDataMap メソッドつかってもOK
        for (const prefObj of dialogMgr.t('degrees')) {
          if (prefObj.id === userData.userDegree) {
            openerElement.value = prefObj.name;
          }
        }
      }
      console.log("編集終了");
      console.log(userData);

    },
    onCancel: (data) => {
      const dialogModel = data.dialog;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      dialogInstance.hide();
    },
    onResume: (data) => {
    }

  });
}
