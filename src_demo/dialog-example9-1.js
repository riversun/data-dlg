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
    onAny: async (data) => {
      const dialogModel = data.dialog;
      const params = dialogModel.params;
      //const person = params.person;
      const opener = dialogModel.opener;
      const dialogInstance = dialogModel.instance;




      // 通常は値をreturnすればそれがresultとして、dialog-example9側に渡されるが、
      // なにかのアクションを待ちたい場合に、 promiseを返しても良い
      return new Promise(async (resolve) => {
        if (data.action === 'delete') {

          // 「本当に削除して良いか」ダイアログを開く
          const opt = {
            type: 'yesno',
            title: 'Deletion ?',
            message: 'You really want to delete?',
          };
          const result = await dialogMgr.showConfirmation(opt);

          if (result === 'positive') {
            // resolve(値：値は省略するとresultがundefinedになって返る)することで
            // onAnyのdeleteとしてこのダイアログが閉じられdialog-example9に戻る
            dialogInstance.hide();
            resolve();

          } else {
            // YES/NOダイアログでキャンセルされた場合は、
            // まだこのダイアログに居座るため、onAny(delete)をdialog-example9にもどらないようにする
            // そのため、resolveでcancel:trueにする
            dialogInstance.show();
            resolve({cancel:true});
          }

        }
      });// promise

    }

  });
}
