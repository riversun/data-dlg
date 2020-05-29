export default async function createDialog(dialogMgr, opt) {

  const userData = opt.userData;

  return dialogMgr.createDialog({
    id: 'dlg-example5',
    url: 'view/dlg-example5-select-single_from_res.html',
    onCreate: (data) => {
      const dialogModel = data.dialog;
      const opener = dialogModel.opener;
      dialogModel.context = {};
      const copyToPropNames = ['userBestPrefecture'];
      dialogMgr.bindModelToContext(
        userData, dialogModel.context, copyToPropNames);
    },
    onApply: (data) => {
      const dialogModel = data.dialog;
      const opener = dialogModel.opener;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素

      const copyToPropNames = ['userBestPrefecture'];
      dialogMgr.bindModelFromContext(
        userData, data.dialog.context, copyToPropNames);


      dialogInstance.hide();

      //選択したデータで元のセルの内容を更新
      if (openerElement) {
        openerElement.value = '';
        // 内部でよければgetListingInputDispDataMap メソッドつかってもOK
        for (const prefObj of dialogMgr.t('prefectures-object')) {
          if (prefObj.id === userData.userBestPrefecture) {
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
