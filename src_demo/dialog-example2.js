export default async function createDialog(dialogMgr, opt) {

  const userData = opt.userData;


  /**
   * 日付関連処理のデモダイアログ
   */
  await dialogMgr.createDialog({
    id: 'dlg-example2',
    //template: TEMPLATE_DIALOG_INPUT_CONDITION,
    url: 'view/dlg-example2-date-inputs.html',
    onCreate: (data) => {

      const dialogModel = data.dialog;
      //const mgr = dialogModel.dialogManager;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const openerElement = opener.element;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

      // dialogModelにdatePickerOptオブジェクトをセットし、その中身にはプロパティ名をキーにしてflatpickr用のオプションをセットできる
      dialogModel.datePickerOpt = { userWakeUpTime: { minuteIncrement: 30,disableMobile:true } };


      // i18resで指定されている場合は同名のラベル
      data.dialog.context = {
        // modelには、i18リソースを使うときのプレースホルダ変数を格納できる。リソース名は'label-title'
        'label-title': { model: { "user-name": "Tom" } },
      };
      const copyToPropNames = ['userBirthday', 'userStartTime', 'userWakeUpTime'];
      dialogMgr.bindModelToContext(
        userData, dialogModel.context, copyToPropNames);


    },
    onShow:(data)=>{


      // time pickerを選択させない
      const eleHour=document.querySelector('.flatpickr-hour');
      eleHour.disabled=true;

      const eleMinutes=document.querySelector('.flatpickr-minute');
      eleMinutes.disabled=true;


    },
    onApply: (data) => {

      const dialogModel = data.dialog;
      //const mgr = dialogModel.dialogManager;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const context = dialogModel.context;//ダイアログの入力状態
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      const openerElement = opener.element;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

      const copyToPropNames = ['userBirthday', 'userStartTime', 'userWakeUpTime'];
      dialogMgr.bindModelFromContext(
        userData, dialogModel.context, copyToPropNames);

      // ダイアログを閉じる
      dialogInstance.hide();

      console.log("編集終了");
      console.log(userData);


    },
    onCancel: (data) => {
      const dialogModel = data.dialog;
      //const mgr = dialogModel.dialogManager;
      const dialogId = dialogModel.id;
      const opener = dialogModel.opener;
      const context = dialogModel.context;//ダイアログの入力状態
      const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
      const openerElement = opener.element;// DATA-APIによってダイアログを開いた要素
      const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
      // ダイアログを閉じる
      dialogInstance.hide();
    },
    onResume: (data) => {
    }

  });

}
