export default async function createDialog(dialogMgr, opt) {

  const userData = opt.userData;
  const friends = opt.friends;

// Setup condition input dialog
  return dialogMgr.createDialog({
    id: 'dlg-example4',
    //template: html
    url: 'view/dlg-example4-select-single.html',
    onCreate: (data) => {
      // onCreateコールバックはダイアログ表示前に呼び出され
      // ダイアログ構築に必要なプレースホルダデータをcontext(ダイアログに表示するための変数の入れ物）
      // にセットする

      const dialogModel = data.dialog;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;

      const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

      dialogModel.context = {
        // modelには、i18リソースを使うときのプレースホルダ変数を格納できる。リソース名は'label-title'
        'label-title': { model: { 'user-name': "Tom" } },

        //選択肢で参照させる
        userNames: friends,
      };

      const copyToPropNames = ['userBestFriend'];
      dialogMgr.bindModelToContext(
        userData, dialogModel.context, copyToPropNames);


    },
    onApply: (data) => {
      const dialogModel = data.dialog;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const context = dialogModel.context;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト


      const copyToPropNames = ['userBestFriend'];
      dialogMgr.bindModelFromContext(
        userData, data.dialog.context, copyToPropNames);
      // ダイアログを閉じる
      dialogInstance.hide();

      //選択したデータで元のセルの内容を更新
      if (openerElement) {
        openerElement.value = '';
        for (let friend of friends) {
          if (userData.userBestFriend === (friend.id)) {
            openerElement.value = friend.name;
          }
        }
      }
      console.log("編集終了");
      console.log(userData);

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
    onResume: (data) => {
      const resumeData = data.resume;
      const openerKey = resumeData.openerKey;
      const openedDialogModel = resumeData.dialogModel;

    }

  });
}
