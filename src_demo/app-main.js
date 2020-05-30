import bsn from "../src_bsn_2.0.27/bootstrap-native-v4";//"bootstrap.native/dist/bootstrap-native-v4";
import DialogManager from "../src/dialog-manager.js";
import createDialog1 from './dialog-example1.js';
import createDialog1_1 from './dialog-example1-1.js';
import createDialog2 from './dialog-example2.js';
import createDialog3 from "./dialog-example3.js";
import createDialog4 from "./dialog-example4.js";
import createDialog5 from "./dialog-example5.js";
import createDialog6 from "./dialog-example6.js";


export default class AppMain {
  constructor() {

    this.friends = [
      { id: 'person_01', name: 'ミッキー' },
      { id: 'person_02', name: 'ミニー' },
      { id: 'person_03', name: 'ベル' },
      { id: 'person_04', name: 'ドナルド' },
      { id: 'person_05', name: 'アリエル' },
      { id: 'person_06', name: 'ジャスミン' },
    ];

    this.userData = {
      userResidence: 1,
      userName: 'Tom',
      userAge: 17,
      userHobbies: [1, 2, 3],
      userWakeUpTime: new Date('2010/04/01 08:00:00'),
      userStartTime: null,
      userBirthday: new Date('2010/04/01 12:13:14'),
      userBestFriend: 'person_03',
      userFriends: ['person_03', 'person_06'],
      userBestPrefecture: 'pref_tokyo',
      userProtectionEnabled: true,
    };

  }

  async start() {

    const locale = 'ja';

    this.dialogMgr = new DialogManager();
    this.dialogMgr.setBsn(bsn);
    this.dialogMgr.setLocale(locale);
    this.dialogMgr.setLoadTemplateOnOpen(false);

    //ネットワークエラーはキャッチする
    try {

      await this.dialogMgr.setResourcesFromUrl('./res/strings.json');
      // ネットからとらずに直接指定する場合は setResourcesWithModel
      await this.buildViews();

    } catch (e) {

      alert(`${e.message}\n
We're sorry for the inconvenience, but please give us enough time to reload your browser.\n
ネットワークエラーが発生しましたお手数ですが時間をあけてからブラウザでリロードをお試しください\n`);
    }
    this.setupDemoCommonDialogs();
    this.render();
  }

  setupDemoCommonDialogs() {
    document.querySelector('#btnYesno').addEventListener('click', async (e) => {
      const opt = {
        type: 'yesno',
        title: { res: 'label-demo-yesno-title' },
        message: { res: 'label-demo-yesno-message', model: { 'user-name': 'Tom' } },
      };
      const result = await this.dialogMgr.showConfirmation(opt);
      alert(result);
    });
    document.querySelector('#btnOkcancel').addEventListener('click', async (e) => {
      const opt = {
        type: 'okcancel',
        title: { res: 'label-demo-okcancel-title' },
        message: { res: 'label-demo-okcancel-message', model: { 'user-name': 'Tom' } },
      };
      const result = await this.dialogMgr.showConfirmation(opt);
      alert(result);
    });

    document.querySelector('#btnOk').addEventListener('click', async (e) => {
      const opt = {
        type: 'ok',
        title: { res: 'label-demo-ok-title' },
        message: { res: 'label-demo-ok-message', model: { 'user-name': 'Tom' } },
      };
      const result = await this.dialogMgr.showConfirmation(opt);
      alert(result);
    });

    document.querySelector('#btnCustom1').addEventListener('click', async (e) => {
      const opt = {
        type: 'okcancel',
        positive: true,// positiveボタンの表示有無
        negative: true,// positiveボタンの表示有無
        neutral: true,// positiveボタンの表示有無
        hasClose: false,//close buttonを持つか否か
        title: '直接タイトルを書く',
        message: 'メッセージも直接書く',
        res: {
          positive: "label-demo-btn-positive",
          negative: "label-demo-btn-negative",
          neutral: "label-demo-btn-neutral"
        },
        class: {
          positive: "btn-success",
          negative: "btn-danger",
          neutral: "btn-warning",
        }

      };
      const result = await this.dialogMgr.showConfirmation(opt);
      alert(result);
    });

    document.querySelector('#btnCustom2').click();

  }

  async buildViews() {
    await createDialog1(this.dialogMgr, { userData: this.userData });
    await createDialog1_1(this.dialogMgr);
    await createDialog2(this.dialogMgr, { userData: this.userData });
    await createDialog3(this.dialogMgr, { userData: this.userData, friends: this.friends });
    await createDialog4(this.dialogMgr, { userData: this.userData, friends: this.friends });
    await createDialog5(this.dialogMgr, { userData: this.userData });
    await createDialog6(this.dialogMgr, { userData: this.userData });

    this.dialogMgr.activate();
  }

  render() {
    // 最新のDOMツリーを再スキャンして、bootstrapのData APIが動作するようにする
    BSN.initCallback();
  }

}
