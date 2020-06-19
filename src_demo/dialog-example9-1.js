export default async function createDialog(dialogMgr, opt) {

  const userData = opt.userData;

  const friends = opt.friends;
  // Setup condition input dialog
  await dialogMgr.createDialog({
    id: 'dlg-example9-1',
    url: 'view/dlg-example9-1-general-inputs.html',
    returnable: true,
    onCreate: (data) => {
      // onCreateコールバックはダイアログ表示前に呼び出され
      // ダイアログ構築に必要なプレースホルダデータをcontext(ダイアログに表示するための変数の入れ物）
      // にセットする

      const dialogModel = data.dialog;
      //const mgr = dialogModel.dialogManager;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

      const selectedPerson = friends.find(data => data.id == dialogParams.personId);

      // context内の同名のプロパティが初期値としてあてがわれる

      dialogModel.context = {
        // modelには、i18リソースを使うときのプレースホルダ変数を格納できる。リソース名は'label-title'
        'label-title': { model: { 'user-name': selectedPerson.name } },

      };


    },
    onApply: (data) => {
      const dialogModel = data.dialog;
      //const mgr = dialogModel.dialogManager;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const context = dialogModel.context;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      dialogInstance.hide();
      // 明示的にreturnすると、その値を返すことができる
      return { userResidence: context['userResidence'] };

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

      //console.log(resumeData.dialogModel.id + "からかえってきた" + openerKey + "のデータ" + openedDialogModel.context.friend);
    }

  });
}
