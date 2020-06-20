export default class Notificator {
  constructor() {
    this.listener = null;
  }

  /**
   * リスナーをセットする
   * (後からセットしたリスナーで上書きされる)
   * @param func
   */
  setListener(func) {
    this.listener = func;
  }

  /**
   * 結果を通知する
   * result:{cancel:true}になっていると通知は実行されない
   * @param data
   */
  notify(data) {
    if (this.listener) {
      const needCancel = (data && data.result && data.result.cancel);
      if (needCancel) {
        // result.cancel=trueなら、notifyしない
        return;
      }
      this.listener(data);
    }
  }
}
