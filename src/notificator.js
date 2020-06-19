export default class Notificator {
  constructor() {
    this.listener = null;
  }

  setListener(func) {
    this.listener = func;
  }

  notify(result) {
    if (this.listener) {
      this.listener(result);
    }
  }
}
