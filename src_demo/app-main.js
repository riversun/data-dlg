import bsn from "bootstrap.native/dist/bootstrap-native-v4";
import DialogManager from "../src_lib/lib/dialog-manager.js";
import createDialog1 from './dialog-example1.js';
import createDialog1_1 from './dialog-example1-1.js';
import createDialog2 from './dialog-example2.js';
import createDialog3 from "./dialog-example3.js";
import createDialog4 from "./dialog-example4.js";
import createDialog5 from "./dialog-example5.js";


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
      userProtectionEnabled:true,
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
    this.render();
  }

  async buildViews() {
    await createDialog1(this.dialogMgr, { userData: this.userData });
    await createDialog1_1(this.dialogMgr);
    await createDialog2(this.dialogMgr, { userData: this.userData });
    await createDialog3(this.dialogMgr, { userData: this.userData, friends: this.friends });
    await createDialog4(this.dialogMgr, { userData: this.userData, friends: this.friends });
    await createDialog5(this.dialogMgr, { userData: this.userData });

    this.dialogMgr.activate();
  }

  render() {
    // 最新のDOMツリーを再スキャンして、bootstrapのData APIが動作するようにする
    BSN.initCallback();
  }

}
