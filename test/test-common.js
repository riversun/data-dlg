import { AjaxClient } from 'ajax-client';

export const SERVER_ENDPOINT = 'http://localhost:9999';

export const INNER_HTML = `<!-- -->
<button id="button1" type="button" data-dlg="dlg-test-1">ダイアログ　情報入力（基本）</button>
<button id="button2" type="button" data-dlg="dlg-test-2">ダイアログ　日付・時間入力</button>
<label>複数選択：チェックボックス（テキストボックスをクリックしてダイアログを開く）</label><br>
<input id="text3" type="text" size=80 data-dlg="dlg-test-3"></input>
<br><br>
<label>単一選択：SELECT（テキストボックスをクリックしてダイアログを開く）</label><br>
<input id="text4" type="text" size=80 data-dlg="dlg-test-4"></input>
<label>単一選択：SELECT（i18Nresからオブジェクトで選択）</label><br>
<input id="text5" type="text" size=80 data-dlg="dlg-test-5"></input>

<label>Common Dialogs</label><br>
<button type="button" id="btnYesno">YES/NO</button>
<button type="button" id="btnOkcancel">OK/Cancel</button>
<button type="button" id="btnOk">OK only</button>
<button type="button" id="btnCustom1">Custom1</button>
<button type="button" id="btnCustom2" data-dlg="dlg-example6">Custom2</button>
<br><br>
`;

export function getFriends() {
  return [
    { id: 'person_01', name: 'ミッキー' },
    { id: 'person_02', name: 'ミニー' },
    { id: 'person_03', name: 'ベル' },
    { id: 'person_04', name: 'ドナルド' },
    { id: 'person_05', name: 'アリエル' },
    { id: 'person_06', name: 'ジャスミン' },
  ];
}

export function getUserData() {
  const userData = {
    userResidence: 1,
    userName: 'Tom',
    userAge: 17,
    userHobbies: [1, 2, 3],
    userWakeUpTime: new Date('2010/04/01 08:00:00'),
    userStartTime: new Date('2020/01/02 2:34:56'),
    userBirthday: new Date('2010/04/01 12:13:14'),
    userBestFriend: 'person_03',
    userFriends: ['person_03', 'person_06'],
    userBestPrefecture: 'pref_tokyo',
    userProtectionEnabled:true,
  };
  return userData;
}


export async function loadResourceFromUrl(url, dataType, comment) {
  return new Promise((resolve, reject) => {
    new AjaxClient().ajax({
      type: 'get',
      url: url,
      contentType: 'application/json',
      dataType: dataType,
      timeoutMillis: 5000,//timeout milli-seconds
      success: (response, xhr) => {
        //1回ダウンロードしたらこのダイアログのテンプレートを記憶する
        resolve(response);
      },
      error: (e, xhr) => {
        reject(new Error(`Network error. while ${comment}`));
        //alert('Network Error occurred.Please reload the page.ネットワークエラーが発生しました、お手数ですがページリロードをおねがいします');
      },
      timeout: (e, xhr) => {
        reject(new Error(`Network timeout error. while ${comment}`));
      }
    });
  });
}
