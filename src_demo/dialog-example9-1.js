export default async function createDialog(dialogMgr, opt) {

  const userData = opt.userData;
  const isFirstTime = true;

  // Setup condition input dialog
  await dialogMgr.createDialog({
    id: 'dlg-example1',
    //template: html
    url: 'view/dlg-example1-general-inputs.html',
    onCreate: (data) => {
      // onCreateコールバックはダイアログ表示前に呼び出され
      // ダイアログ構築に必要なプレースホルダデータをcontext(ダイアログに表示するための変数の入れ物）
      // にセットする

      const dialogModel = data.dialog;
      //const mgr = dialogModel.dialogManager;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const openerElement = opener.element;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

      // ポイント
      // contextに入れた値が、viewテンプレートのプレースホルダー(#{name}表記)に反映される
      // リソースにプレースホルダーと同名のプロパティ名があれば、それが描画される
      // contextにプレースホルダーと同名のプロパティ名があれば、リソースよりも優先されそれが描画される
      // viewテンプレートのinput要素など入力系要素の属性に変数指定(data-dlg-prop属性でプロパティ名を指定)があれば、
      // context内の同名のプロパティが初期値としてあてがわれる
      dialogModel.context = {
        // modelには、i18リソースを使うときのプレースホルダ変数を格納できる。リソース名は'label-title'
        'label-title': { model: { 'user-name': "Tom" } },
        //resには、i18リソース名を直接指定することができる。
        'label-comment': { res: isFirstTime ? "label-comment-first-time" : "label-comment-update" },
        //'prefectures':{model:{prefectures_index:0}},

        // 直接、↓のようにかけば、viewテンプレートに同名のプレースフォルダがあれば、viewに表示される
        // userResidence: 1,
        // userName: 'Tom',
        // userAge: 30,
        // userHobbies: [1, 2, 3],
      };

      // ポイント
      // 変数を入力系要素にあてがうとき、あるmodelオブジェクトをそのまま使いたいことがある
      // その場合はそのmodelオブジェクトのプロパティを以下ヘルパーメソッドをつかってcontextにコピーできる
      // model => context の場合はヘルパーメソッド bindModelToContext(modle,context, keys) が使える
      // context => model　の場合はヘルパーメソッド bindModelFromContext(model, context, keys)　が使える
      // userDataにある値をcontextに格納(そうすることで、userDataにある値がviewで表示できるようになる)
      const copyToPropNames = ['userResidence', 'userName', 'userAge', 'userHobbies', 'userProtectionEnabled'];
      dialogMgr.bindModelToContext(
        userData, dialogModel.context, copyToPropNames);

    },
    onApply: (data) => {
      // onApplyコールバックは、ダイアログ上でユーザーがapplyアクションをおこした場合
      // に呼び出される。
      // 入力値のバリデーションも、このコールバック関数内で行い、問題があれば
      // 再入力を促すメッセージを表示するなど処理する。

      const dialogModel = data.dialog;
      //const mgr = dialogModel.dialogManager;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const context = dialogModel.context;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      const openerElement = opener.element;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

      // 入力値の検証をおこなう
      const userAge = context.userAge;
      if (userAge < 18 || 60 < userAge) {

        //問題があればエラーメッセージを表示する
        // data-dlg-hidden="msg-for-userAge" のようにしておくことで、この属性がついている要素は
        // contextプロパティ"msg-for-userAge"に値が入らない限り表示されないようになる
        dialogModel.context['msg-for-userAge'] =
          { res: (userAge < 18) ? 'err-user-age-under' : (60 < userAge) ? 'err-user-age-over' : null };
        // このダイアログを再表示して、エラーが表示された状態にする

        // バリデーションの際の再描画のときは、オートフォーカスはあたらないようにする
        dialogModel.focusProperty = 'none';
        dialogMgr.refreshDialog(dialogId);
        return;
      }

      // 問題がなければ、ダイアログのもつ contextをユーザー変数である userDataにコピーする
      // model => context の場合はヘルパーメソッド bindModelToContext(modle,context, keys) が使える
      // context => model　の場合はヘルパーメソッド bindModelFromContext(model, context, keys)　が使える
      // userDataにある値をcontextに格納(そうすることで、userDataにある値がviewで表示できるようになる)
      const copyToPropNames = ['userResidence', 'userName', 'userAge', 'userHobbies', 'userProtectionEnabled'];
      dialogMgr.bindModelFromContext(
        userData, data.dialog.context, copyToPropNames);
      // ダイアログを閉じる
      dialogInstance.hide();

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

      //console.log(resumeData.dialogModel.id + "からかえってきた" + openerKey + "のデータ" + openedDialogModel.context.friend);
    }

  });
}
