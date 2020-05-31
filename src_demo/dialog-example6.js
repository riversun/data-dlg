export default async function createDialog(dialogMgr, opt) {

  const userData = opt.userData;
  const isFirstTime = false;

  // Setup condition input dialog
  await dialogMgr.createDialog({
    id: 'dlg-example6',
    //template: html
    url: 'view/dlg-example6-open-external-window.html',
    onCreate: (data) => {
      const dialogModel = data.dialog;

      dialogModel.context = {
        'label-title': { model: { 'user-name': "Tom" } },
        'label-comment': { res: isFirstTime ? "label-comment-first-time" : "label-comment-update" },
      };
      dialogMgr.bindModelToContext(userData, dialogModel.context);
    },
    onApply: (data) => {
      const dialogModel = data.dialog;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      dialogInstance.hide();
    },
    onCancel: (data) => {
      // ダイアログがキャンセルされたときに、呼び出される
      const dialogModel = data.dialog;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      dialogInstance.hide();
    },
    onAny: async (data) => {
      const dialogModel = data.dialog;
      const opener = dialogModel.opener;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      const openerElement = opener ? opener.element : null;
      const action = data.action;

      if (action === 'delete') {
        const opt = {
          type: 'yesno',
          title: { res: 'label-demo-confirm-delete-user-title' },
          message: { res: 'label-demo-confirm-delete-user-message', model: { 'user-name': 'Tom' } },
        };
        // 本当に削除していいかを確認
        const confirmResult = await dialogMgr.showConfirmation(opt);
        if (confirmResult === 'positive') {

          // OKで確認するダイアログを表示
          await dialogMgr.showConfirmation({
            type: 'ok',
            title: { res: 'label-demo-confirm-delete-user-title' },
            message: { res: 'label-demo-finished-delete-user', model: { 'user-name': 'Tom' } }
          });

        } else {
          dialogInstance.show();
        }
      }
    },
    onResume: (data) => {
      const resumeData = data.resume;
      const openerKey = resumeData.openerKey;
      const openedDialogModel = resumeData.dialogModel;

      //console.log(resumeData.dialogModel.id + "からかえってきた" + openerKey + "のデータ" + openedDialogModel.context.friend);
    }

  });
}
