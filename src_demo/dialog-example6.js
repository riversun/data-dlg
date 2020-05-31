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
      // 【forceRemoveOverlayについて】
      // 以下の症状に対応するためforceRemoveOverlayというメソッドをbsnに追加したソースを読み込むことにした(2020/5/30)
      // どのバージョンのbsnを変更したか、や、ソース変更箇所は about.txtを参照。
      // ＜再現手順＞
      // STEP1.あるダイアログAを開く。
      // STEP2.ダイアログAは開いた状態で別のダイアログBをshowして開く。（ダイアログAは自動で閉じる)
      // STEP3.ダイアログBを開いた状態で、hideメソッドでダイアログBを閉じる。
      // STEP4.ダイアログAを再び開くと、backdrop(黒背景)が表示されなくなる
      // （ただし、STEP3でダイアログBを閉じないで、ダイアログAをshowメソッドで開けば症状は出ない)
      //＜原因＞
      //どうやら overlay というオブジェクトがbackdropの正体らしいが、
      // ダイアログBを開くと、ダイアログAのoverlayが透明になった状態で
      //残り続けてしまうらしい。overlayが残っていると、あらたなbackdropが生成されず、
      //症状のようになる。
      //＜ワークアラウンド＞
      //showメソッドでダイアログを開くときに、既存のオーバーレイ(backdropのゾンビ)を強制的に削除する
      //forceRemoveOverlayをつくった。dialogModel.forceRemoveOverlay=trueの場合は、
      //refreshDialog内でbsn.Modal#showメソッドよりも前にbsn.Modal#forceRemoveOverlayメソッドを呼んで
      //ゾンビ化したbackdropを削除するようにする。
      //＜ポイント＞
      // 外部ダイアログを開いて、それっきり元のダイアログに戻らないような片道切符な導線を設計した場合は
      // このワークアラウンドを onCreateの中に入れておくとよい。onCreateはダイアログをcreateしたときだけ
      // つまり、ダイアログがまだ表示されていないときに表示したときだけ
      //　実行されるので、 dialogModel.forceRemoveOverlay=trueをそこに記述しておく。
      // さらに、dialogModel.forceRemoveOverlay=trueは1回 forceRemoveOverlayが実行されると自動でfalseになるようにしてある

      dialogModel.forceRemoveOverlay = true;// このダイアログは子ダイアログを片道切符で開くのでゾンビbackdropを消去できるようこのフラグをたてる

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
