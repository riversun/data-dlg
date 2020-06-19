export default async function createDialog(dialogMgr, opt) {

  const friends = opt.friends;
  // Setup condition input dialog
  await dialogMgr.createDialog({
    id: 'dlg-example9',
    //template: html
    url: 'view/dlg-example9-show-external-dialog.html',
    onCreate: (data) => {
      const dialogModel = data.dialog;
      const opener = dialogModel.opener;
      dialogModel.context = {
        persons:friends,
        personId: 'person01',
      };

    },
    onShow: (data) => {
      const dialogModel = data.dialog;
      const ele = dialogModel.element;
      const context = data.dialog.context;

      const radios = ele.querySelectorAll(`[id^=radio-persons]`);
      for (const radio of radios) {
        radio.addEventListener('change', async (e) => {
          const target = e.target;
          const id = target.id.split('--')[1];
          // view上で選択されている表示期間をクリックしたラジオボタンにする
          context['personId'] = id;

        });
      }
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


      dialogInstance.hide();
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
