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
        persons: friends,
        personId: 'person_01',
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
    onApply: async (data) => {

      const dialogModel = data.dialog;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const context = dialogModel.context;
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      const openerElement = opener.element;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

      const dlgResult = await dialogMgr.showDialog('dlg-example9-1', { params: { personId: context.personId } });
      console.log(`external dialog result action="${dlgResult.action}"`);
      if (dlgResult.action === 'apply') {
        dialogInstance.hide();
        const selectedUserResidence = dlgResult.result.userResidence;
        // 適用されたのでダイアログを閉じた状態のままおわり
      }
      else if (dlgResult.action === 'cancel') {
        // 適用されなかったので、ふたたびこのダイアログを開いてユーザー入力を促す
        dialogInstance.show();
      }else if (dlgResult.action === 'delete') {
        // dialog-example9-1で削除が「実行済」なので、このダイアログを閉じる
        dialogInstance.hide();
      }

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
