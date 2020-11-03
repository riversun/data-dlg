import DialogManager from "../src/dialog-manager";
import { typeOf } from "../src/common-utils";
import bsn from "../src_bsn_2.0.27/bootstrap-native-v4.js";//"bootstrap.native/dist/bootstrap-native-v4";

import { SERVER_ENDPOINT, INNER_HTML, loadResourceFromUrl, getFriends, getUserData } from "./test-common.js";

function createDlgMgr() {

  const dialogMgr = new DialogManager();
  const locale = 'en';
  dialogMgr.setBsn(bsn);
  dialogMgr.setLocale(locale);
  dialogMgr.setLoadTemplateOnOpen(false);
  return dialogMgr;
}


describe('DialogManager', () => {


  describe('bindModelFromContext()', () => {
    test('without keys', () => {
      const dialogMgr = createDlgMgr();
      const model = {
        name: 'Riversun',
        hobby: 'Programming',
      }
      const context = {
        name: 'Tom',
        pets: ['dog', 'cat']
      }
      // without keys
      dialogMgr.bindModelFromContext(model, context);
      expect(model.name).toBe('Tom');// copied
      expect(model.hobby).toBe('Programming');// not copied
      expect(model.pets).toBeUndefined();
    });

    test('with keys', () => {
      const dialogMgr = createDlgMgr();
      const model = {
        name: 'Riversun',
        hobby: 'Programming',
      }
      const context = {
        name: 'Tom',
        pets: ['dog', 'cat'],
        address: 'Tokyo',
      }
      // without keys
      dialogMgr.bindModelFromContext(model, context, ['pets']);
      expect(model.name).toBe('Riversun');// copied
      expect(model.hobby).toBe('Programming');// not copied
      expect(model.pets).toEqual(['dog', 'cat']);
      expect(model.address).toBeUndefined();


    });
  });

  describe('showConfirmation()', () => {
    // yesnoダイアログで YES をクリックすると positive が返ることを確認
    test('[yesno dialog] YES clicked', async (done) => {
      document.body.innerHTML = INNER_HTML;
      const dialogMgr = createDlgMgr();


      await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
      const opt = {
        type: 'yesno',
        title: { res: 'label-demo-yesno-title' },
        message: { res: 'label-demo-yesno-message', model: { 'user-name': 'Tom' } },
      };
      // <button type="button" class="btn #{data-dlg-common-confirmation-class-positive}" data-dlg-hidden="isPositive" data-dlg-action="apply">#{data-dlg-common-confirmation-label-positive}</button>
      //     <button type="button" class="btn #{data-dlg-common-confirmation-class-negative}" data-dlg-hidden="isNegative" data-dlg-action="cancel">#{data-dlg-common-confirmation-label-negative}</button>
      //     <button type="button" class="btn #{data-dlg-common-confirmation-class-neutral}" data-dlg-hidden="isNeutral" data-dlg-action="neutral">#{data-dlg-common-confirmation-label-neutral}</button>

      const confDialogId = dialogMgr.getNextConfirmationDialogId();
      setTimeout(() => {
        const confDialogModel = dialogMgr.getDialogModelById(confDialogId);
        const confDialogElement = confDialogModel.element;
        const btnConfPositive = confDialogElement.querySelector('[data-dlg-action=apply]');
        const btnConfNegative = confDialogElement.querySelector('.btn[data-dlg-action=cancel]');
        const btnConfNeutral = confDialogElement.querySelector('[data-dlg-action=neutral]');
        const btnConfClose = confDialogElement.querySelector('.close[data-dlg-action=cancel]');
        const innerHTML = confDialogElement.innerHTML;

        //ボタンの表示非表示を確認
        expect(btnConfPositive.style.display).toBe('block');
        expect(btnConfNegative.style.display).toBe('block');
        expect(btnConfNeutral.style.display).toBe('none');
        expect(btnConfClose.style.display).toBe('block');

        //ボタン表示文字列を確認
        expect(btnConfPositive.innerHTML).toContain(dialogMgr.t('common-yes'));
        expect(btnConfNegative.innerHTML).toContain(dialogMgr.t('common-no'));
        expect(btnConfNeutral.innerHTML).toBeFalsy();

        //指定したリソースがダイアログに含まれていること
        expect(innerHTML).toContain(dialogMgr.t('label-demo-yesno-title'));
        expect(innerHTML).toContain(dialogMgr.t('label-demo-yesno-message', { 'user-name': 'Tom' }));

        // showConfirmationするまで500ミリ秒まった後、
        // 確認ダイアログ上のapplyボタンをクリックする
        btnConfPositive.click();
      }, 1000);


      const result = await dialogMgr.showConfirmation(opt);
      expect(result).toBe('positive');
      done();
    });//test

    // yesnoダイアログで NO をクリックすると negative が返ることを確認
    test('[yesno dialog] NO clicked', async (done) => {
      document.body.innerHTML = INNER_HTML;
      const dialogMgr = createDlgMgr();
      await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
      const opt = {
        type: 'yesno',
        title: { res: 'label-demo-yesno-title' },
        message: { res: 'label-demo-yesno-message', model: { 'user-name': 'Tom' } },
      };
      const confDialogId = dialogMgr.getNextConfirmationDialogId();

      setTimeout(() => {
        const confDialogModel = dialogMgr.getDialogModelById(confDialogId);
        const confDialogElement = confDialogModel.element;
        const btnConfPositive = confDialogElement.querySelector('[data-dlg-action=apply]');
        const btnConfNegative = confDialogElement.querySelector('.btn[data-dlg-action=cancel]');
        // showConfirmationするまで1000ミリ秒まった後、
        // 確認ダイアログ上のapplyボタンをクリックする
        btnConfNegative.click();
      }, 1000);
      const result = await dialogMgr.showConfirmation(opt);
      expect(result).toBe('negative');
      done();

    });//test

    // okcancelダイアログで OK をクリックすると positive が返ることを確認
    test('[okcancel dialog] OK clicked', async (done) => {
      document.body.innerHTML = INNER_HTML;
      const dialogMgr = createDlgMgr();
      await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
      const opt = {
        type: 'okcancel',
        title: { res: 'label-demo-okcancel-title' },
        message: { res: 'label-demo-okcancel-message', model: { 'user-name': 'Tom' } },
      };

      const confDialogId = dialogMgr.getNextConfirmationDialogId();
      setTimeout(() => {
        const confDialogModel = dialogMgr.getDialogModelById(confDialogId);
        const confDialogElement = confDialogModel.element;
        const btnConfPositive = confDialogElement.querySelector('[data-dlg-action=apply]');
        const btnConfNegative = confDialogElement.querySelector('.btn[data-dlg-action=cancel]');
        const btnConfNeutral = confDialogElement.querySelector('[data-dlg-action=neutral]');
        const btnConfClose = confDialogElement.querySelector('.close[data-dlg-action=cancel]');
        const innerHTML = confDialogElement.innerHTML;

        //ボタンの表示非表示を確認
        expect(btnConfPositive.style.display).toBe('block');
        expect(btnConfNegative.style.display).toBe('block');
        expect(btnConfNeutral.style.display).toBe('none');
        expect(btnConfClose.style.display).toBe('block');

        //ボタン表示文字列を確認
        expect(btnConfPositive.innerHTML).toContain(dialogMgr.t('common-ok'));
        expect(btnConfNegative.innerHTML).toContain(dialogMgr.t('common-cancel'));
        expect(btnConfNeutral.innerHTML).toBeFalsy();

        //指定したリソースがダイアログに含まれていること
        expect(innerHTML).toContain(dialogMgr.t('label-demo-okcancel-title'));
        expect(innerHTML).toContain(dialogMgr.t('label-demo-okcancel-message', { 'user-name': 'Tom' }));

        // showConfirmationするまで500ミリ秒まった後、
        // 確認ダイアログ上のapplyボタンをクリックする
        btnConfPositive.click();
      }, 1000);
      const result = await dialogMgr.showConfirmation(opt);
      expect(result).toBe('positive');
      done();
    });//test

    // okcancelダイアログで Cancel をクリックすると negative が返ることを確認
    test('[okcancel dialog] Cancel clicked', async (done) => {
      document.body.innerHTML = INNER_HTML;
      const dialogMgr = createDlgMgr();
      await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
      const opt = {
        type: 'okcancel',
        title: { res: 'label-demo-okcancel-title' },
        message: { res: 'label-demo-okcancel-message', model: { 'user-name': 'Tom' } },
      };
      const confDialogId = dialogMgr.getNextConfirmationDialogId();
      setTimeout(() => {
        const confDialogModel = dialogMgr.getDialogModelById(confDialogId);
        const confDialogElement = confDialogModel.element;
        const btnConfNegative = confDialogElement.querySelector('.btn[data-dlg-action=cancel]');
        btnConfNegative.click();
      }, 1000);
      const result = await dialogMgr.showConfirmation(opt);
      expect(result).toBe('negative');
      done();
    });//test

    // okオンリーダイアログで OK をクリックすると positive が返ることを確認、closeボタンが無いことを確認
    test('[ok dialog] OK clicked', async (done) => {
      document.body.innerHTML = INNER_HTML;
      const dialogMgr = createDlgMgr();
      await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
      const opt = {
        type: 'ok',
        title: { res: 'label-demo-ok-title' },
        message: { res: 'label-demo-ok-message', model: { 'user-name': 'Tom' } },
      };
      // <button type="button" class="btn #{data-dlg-common-confirmation-class-positive}" data-dlg-hidden="isPositive" data-dlg-action="apply">#{data-dlg-common-confirmation-label-positive}</button>
      //     <button type="button" class="btn #{data-dlg-common-confirmation-class-negative}" data-dlg-hidden="isNegative" data-dlg-action="cancel">#{data-dlg-common-confirmation-label-negative}</button>
      //     <button type="button" class="btn #{data-dlg-common-confirmation-class-neutral}" data-dlg-hidden="isNeutral" data-dlg-action="neutral">#{data-dlg-common-confirmation-label-neutral}</button>

      const confDialogId = dialogMgr.getNextConfirmationDialogId();
      setTimeout(() => {
        const confDialogModel = dialogMgr.getDialogModelById(confDialogId);
        const confDialogElement = confDialogModel.element;
        const btnConfPositive = confDialogElement.querySelector('[data-dlg-action=apply]');
        const btnConfNegative = confDialogElement.querySelector('.btn[data-dlg-action=cancel]');
        const btnConfNeutral = confDialogElement.querySelector('[data-dlg-action=neutral]');
        const btnConfClose = confDialogElement.querySelector('.close[data-dlg-action=cancel]');
        const innerHTML = confDialogElement.innerHTML;

        //ボタンの表示非表示を確認
        expect(btnConfPositive.style.display).toBe('block');// 表示されるのはokのみ
        expect(btnConfNegative.style.display).toBe('none');//
        expect(btnConfNeutral.style.display).toBe('none');
        expect(btnConfClose.style.display).toBe('none');// closeボタンも表示されない

        //ボタン表示文字列を確認
        expect(btnConfPositive.innerHTML).toContain(dialogMgr.t('common-ok'));
        expect(btnConfNegative.innerHTML).toBeFalsy();
        expect(btnConfNeutral.innerHTML).toBeFalsy();

        //指定したリソースがダイアログに含まれていること
        expect(innerHTML).toContain(dialogMgr.t('label-demo-ok-title'));
        expect(innerHTML).toContain(dialogMgr.t('label-demo-ok-message', { 'user-name': 'Tom' }));

        // showConfirmationするまで1000ミリ秒まった後、
        // 確認ダイアログ上のapplyボタンをクリックする
        btnConfPositive.click();
      }, 1000);
      const result = await dialogMgr.showConfirmation(opt);
      expect(result).toBe('positive');
      done();
    });//test

    // 確認ダイアログをカスタムして、positive,negative,neutralの3種類表示。ボタンのスタイル変更、positiveクリック
    test('[custom confirmation dialog] 3 buttons and click positive', async (done) => {
      document.body.innerHTML = INNER_HTML;
      const dialogMgr = createDlgMgr();
      await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
      const opt = {
        type: 'okcancel',
        positive: true,// positiveボタンの表示有無
        negative: true,// positiveボタンの表示有無
        neutral: true,// positiveボタンの表示有無
        close: false,//close buttonを持つか否か
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
      // <button type="button" class="btn #{data-dlg-common-confirmation-class-positive}" data-dlg-hidden="isPositive" data-dlg-action="apply">#{data-dlg-common-confirmation-label-positive}</button>
      //     <button type="button" class="btn #{data-dlg-common-confirmation-class-negative}" data-dlg-hidden="isNegative" data-dlg-action="cancel">#{data-dlg-common-confirmation-label-negative}</button>
      //     <button type="button" class="btn #{data-dlg-common-confirmation-class-neutral}" data-dlg-hidden="isNeutral" data-dlg-action="neutral">#{data-dlg-common-confirmation-label-neutral}</button>

      const confDialogId = dialogMgr.getNextConfirmationDialogId();
      setTimeout(() => {
        const confDialogModel = dialogMgr.getDialogModelById(confDialogId);
        const confDialogElement = confDialogModel.element;
        const btnConfPositive = confDialogElement.querySelector('[data-dlg-action=apply]');
        const btnConfNegative = confDialogElement.querySelector('.btn[data-dlg-action=cancel]');
        const btnConfNeutral = confDialogElement.querySelector('[data-dlg-action=neutral]');
        const btnConfClose = confDialogElement.querySelector('.close[data-dlg-action=cancel]');
        const innerHTML = confDialogElement.innerHTML;

        //ボタンの表示非表示を確認
        expect(btnConfPositive.style.display).toBe('block');// 表示されるのはokのみ
        expect(btnConfNegative.style.display).toBe('block');//
        expect(btnConfNeutral.style.display).toBe('block');
        expect(btnConfClose.style.display).toBe('none');// closeボタンも表示されない

        //ボタン表示文字列を確認
        expect(btnConfPositive.innerHTML).toContain(dialogMgr.t('label-demo-btn-positive'));
        expect(btnConfNegative.innerHTML).toContain(dialogMgr.t('label-demo-btn-negative'));
        expect(btnConfNeutral.innerHTML).toContain(dialogMgr.t('label-demo-btn-neutral'));

        //ボタンのスタイルを確認
        expect(btnConfPositive.className).toContain('btn-success');
        expect(btnConfNegative.className).toContain('btn-danger');
        expect(btnConfNeutral.className).toContain('btn-warning');

        //指定したリソースがダイアログに含まれていること
        expect(innerHTML).toContain('直接タイトルを書く');
        expect(innerHTML).toContain('メッセージも直接書く');

        // showConfirmationするまで1000ミリ秒まった後、
        // 確認ダイアログ上のapplyボタンをクリックする
        btnConfPositive.click();
      }, 1000);
      const result = await dialogMgr.showConfirmation(opt);
      expect(result).toBe('positive');
      done();


    });//test

    // 確認ダイアログをカスタムして、positive,negative,neutralの3種類表示。ボタンのスタイル変更、negativeクリック
    test('[custom confirmation dialog] 3 buttons and click negative', async (done) => {
      document.body.innerHTML = INNER_HTML;
      const dialogMgr = createDlgMgr();
      await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
      const opt = {
        type: 'okcancel',
        positive: true,// positiveボタンの表示有無
        negative: true,// positiveボタンの表示有無
        neutral: true,// positiveボタンの表示有無
        close: false,//close buttonを持つか否か
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
      const confDialogId = dialogMgr.getNextConfirmationDialogId();
      setTimeout(() => {
        const confDialogModel = dialogMgr.getDialogModelById(confDialogId);
        const confDialogElement = confDialogModel.element;
        const btnConfPositive = confDialogElement.querySelector('[data-dlg-action=apply]');
        const btnConfNegative = confDialogElement.querySelector('.btn[data-dlg-action=cancel]');
        const btnConfNeutral = confDialogElement.querySelector('[data-dlg-action=neutral]');
        // showConfirmationするまで1000ミリ秒まった後、
        // 確認ダイアログ上のapplyボタンをクリックする
        btnConfNegative.click();
      }, 1000);
      const result = await dialogMgr.showConfirmation(opt);
      expect(result).toBe('negative');
      done();
    });//test

    // 確認ダイアログをカスタムして、positive,negative,neutralの3種類表示。ボタンのスタイル変更、neutralクリック
    test('[custom confirmation dialog] 3 buttons and click neutral', async (done) => {
      document.body.innerHTML = INNER_HTML;
      const dialogMgr = createDlgMgr();
      await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
      const opt = {
        type: 'okcancel',
        positive: true,// positiveボタンの表示有無
        negative: true,// positiveボタンの表示有無
        neutral: true,// positiveボタンの表示有無
        close: false,//close buttonを持つか否か
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
      const confDialogId = dialogMgr.getNextConfirmationDialogId();
      setTimeout(() => {
        const confDialogModel = dialogMgr.getDialogModelById(confDialogId);
        const confDialogElement = confDialogModel.element;
        const btnConfPositive = confDialogElement.querySelector('[data-dlg-action=apply]');
        const btnConfNegative = confDialogElement.querySelector('.btn[data-dlg-action=cancel]');
        const btnConfNeutral = confDialogElement.querySelector('[data-dlg-action=neutral]');
        // showConfirmationするまで1000ミリ秒まった後、
        // 確認ダイアログ上のapplyボタンをクリックする
        btnConfNeutral.click();
      }, 1000);
      const result = await dialogMgr.showConfirmation(opt);
      expect(result).toBe('neutral');
      done();
    });//test

    // ダイアログから、確認ダイアログを開いて、さらに確認ダイアログを開く
    //(backdrop検査でひっかかることがあるので、 ライブラリ側を overlay=nullのときmodalOverlayも0にセットするよう変更)
    test('[custom dialog] open dialog from dialog', async (done) => {
      const userData = getUserData();
      document.body.innerHTML = INNER_HTML;

      const dialogMgr = createDlgMgr();
      await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
      await dialogMgr.createDialog({
        id: 'dlg-test-6',
        url: `${SERVER_ENDPOINT}/view/dlg-test-6-open-external-window.html`,
        onCreate: (data) => {
          const dialogModel = data.dialog;
          dialogModel.context = {
            'label-title': { model: { 'user-name': "Tom" } },
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
      });

      const dialogModel = dialogMgr.getDialogModelById('dlg-test-6');
      const dialogElement = dialogModel.element;
      dialogElement.addEventListener('hidden.bs.modal', (e) => {
      });

      dialogElement.addEventListener('shown.bs.modal', (e) => {
        // ビューが表示された


        //これから表示される確認ダイアログのdialogIdを前もって取得しておく
        const confirmationDialog1Id = dialogMgr.getNextConfirmationDialogId();

        setTimeout(() => {
          //ユーザー削除ボタンを押した後、確認ダイアログがでている状態（のはず）
          const confirmDialog1 = dialogMgr.getDialogModelById(confirmationDialog1Id);
          const confirmDialog1Ele = confirmDialog1.element;
          const confirmDialog1HTML = confirmDialog1Ele.innerHTML;
          //確認ダイアログに正しいメッセージが表示されていることを確認
          expect(confirmDialog1HTML).toContain('Do you really want to delete user:Tom?');

          //ダイアログを順番に開いていっても、バックドロップ(黒背景)が存在していることを確認
          const modalDrop = document.querySelector('.modal-backdrop');
          expect(modalDrop).toBeTruthy();

          // さらに、次に開く確認ダイアログのdialogIdを取得しておく
          const confirmationDialog2Id = dialogMgr.getNextConfirmationDialogId();

          setTimeout(() => {
            // 1秒後には、２つめの確認ダイアログ(okだけのダイアログ)が開いている（はず）
            const confirmDialog2 = dialogMgr.getDialogModelById(confirmationDialog2Id);
            const confirmDialog2Ele = confirmDialog2.element;
            const confirmDialog2HTML = confirmDialog2Ele.innerHTML;
            expect(confirmDialog2HTML).toContain('User:Tom deletion completed.');
            confirmDialog2Ele.addEventListener("hidden.bs.modal", () => {
              //２つめのダイアログが完全に非表示になった場合

              // bsnはhidden.bs.modal時点だと、まだbackdropがのこっている仕様のようなので、
              //そこから少しまったあと、backdropが消えていることも確認してテストを終える
              setTimeout(() => {
                // モーダルのbackdrop（黒背景）も消えている
                const modalDrop = document.querySelector('.modal-backdrop');
                expect(modalDrop).toBeFalsy();
                //テスト終了
                done();
              }, 300);
            });

            const btnConfirmDialog2OK = confirmDialog2Ele.querySelector('[data-dlg-action="apply"]');
            btnConfirmDialog2OK.click();

          }, 300);

          // 確認ダイアログ1のOKボタンを取得
          const btnConfirmDialog1OK = confirmDialog1Ele.querySelector('[data-dlg-action="apply"]');
          btnConfirmDialog1OK.click();

        }, 300);
        // ユーザー削除ボタンを押す（これでダイアログがでる)
        const btnDeleteUser = dialogElement.querySelector('[data-dlg-action="delete"]');
        btnDeleteUser.click();

      });


      dialogMgr.activate();// ダイアログ関連のイベント登録
      BSN.initCallback();// Bootstrap4のDataAPIを有効化


      const btnCustom2 = document.querySelector('#btnCustom2');
      //最初のダイアログを起動
      btnCustom2.click();

    });//test

  });// describe
  describe('setLocale()', () => {
    test('set "ja" ', async () => {
        const dialogMgr = createDlgMgr();
        dialogMgr.setLocale('ja');

        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        expect(dialogMgr.t('test')).toBe('テスト');
      }
    );//test
    test('set "en" ', async () => {
        const dialogMgr = createDlgMgr();
        dialogMgr.setLocale('en');
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        expect(dialogMgr.t('test')).toBe('test');
      }
    );//test
  });// describe
  describe('setResourcesFromUrl()', () => {
    test('Default', async () => {
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        expect(dialogMgr.t('test')).toBe('test');
      }
    );
  });// describe
  describe('setResourcesWithModel()', () => {
    // url取得ではなくリソースをモデルで指定する
    test('[dialog1] default', async (done) => {
        const userData = getUserData();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();

        //loadResourceFromUrl
        const stringsRes = await loadResourceFromUrl(`${SERVER_ENDPOINT}/res/strings.json`, 'json');

        await dialogMgr.setResourcesWithModel(stringsRes);
        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素

            dialogModel.context = {};

            const copyToPropNames = ['userResidence', 'userName', 'userAge', 'userHobbies', 'userProtectionEnabled'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);

          },
          onApply: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素

            const context = data.dialog.context;
            expect(context.userName).toBe('John Doh');
            expect(context.userResidence).toBe(2);
            expect(context.userAge).toBe(30);
            expect(context.userProtectionEnabled).toBe(false);


            // ダイアログを閉じる
            dialogInstance.hide();
          },
          onCancel: (data) => {
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-1');
        const dialogElement = dialogModel.element;

        dialogElement.addEventListener('hidden.bs.modal', (e) => {
          done();
        });

        dialogElement.addEventListener('shown.bs.modal', (e) => {
          // ビューが表示された

          // ビューを編集する
          const texUserName = dialogElement.querySelector('[data-dlg-prop="userName"]');
          const numUserResidence = dialogElement.querySelector('[data-dlg-prop="userResidence"]');
          const numUserAge = dialogElement.querySelector('[data-dlg-prop="userAge"]');//data-dlg-prop="userName"
          const arrUserHobbies = dialogElement.querySelector('[data-dlg-multi-prop="userHobbies"]');//data-dlg-prop="userName"
          const booleanUserProtectionEnabled = dialogElement.querySelector('[data-dlg-prop="userProtectionEnabled"]');

          // 入力値を変更する
          texUserName.value = 'John Doh';
          numUserAge.value = 30;
          numUserResidence.value = 2;
          booleanUserProtectionEnabled.checked = false;

          // userHobbiesはこのダイアログそのものではなく、このダイアログで開いた
          // 別のダイアログで編集するのでここでは変更しない

          // Applyボタンをクリックする
          const btnApply = dialogElement.querySelector('[data-dlg-action="apply"]');
          btnApply.click();
        });

        // dialog1を表示する
        const button1 = document.querySelector('#button1');
        button1.click();


      }
    );//test
  });// describe
  describe('loadResourceFromUrl()', () => {
    // ダイアログを表示したあと、ビューに値を入力し値をApplyしたとっきContextに正しく反映されているかを確認する
    test('default', async (done) => {

      const dialogMgr = createDlgMgr();


      await dialogMgr.loadResourceFromUrl(`${SERVER_ENDPOINT}/nothing`, 'json', 'testing', 1000)
        .catch((err) => {
          expect(err.message).toContain('Network error. while testing');
          done();
        });

      await dialogMgr.loadResourceFromUrl(`${SERVER_ENDPOINT}/timeout`, 'json', 'testing', 1000)
        .catch((err) => {
          expect(err.message).toContain('Network timeout error. while testing');
          done();
        });
    });
  });// describe
  describe('setLoadTemplateOnOpen()', () => {
    // ダイアログを表示したあと、ビューに値を入力し値をApplyしたとっきContextに正しく反映されているかを確認する
    test('[dialog1] default', async (done) => {
        const userData = getUserData();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        //ダイアログを開くときにダイアログのテンプレートHTMLを読み込む
        dialogMgr.setLoadTemplateOnOpen(true);

        //loadResourceFromUrl
        const stringsRes = await loadResourceFromUrl(`${SERVER_ENDPOINT}/res/strings.json`, 'json');

        await dialogMgr.setResourcesWithModel(stringsRes);
        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素

            dialogModel.context = {};

            const copyToPropNames = ['userResidence', 'userName', 'userAge', 'userHobbies', 'userProtectionEnabled'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);

          },
          onApply: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素

            const context = data.dialog.context;
            expect(context.userName).toBe('John Doh');
            expect(context.userResidence).toBe(2);
            expect(context.userAge).toBe(30);
            expect(context.userProtectionEnabled).toBe(false);


            // ダイアログを閉じる
            dialogInstance.hide();
          },
          onCancel: (data) => {
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-1');
        const dialogElement = dialogModel.element;

        dialogElement.addEventListener('hidden.bs.modal', (e) => {
          done();
        });

        dialogElement.addEventListener('shown.bs.modal', (e) => {
          // ビューが表示された

          // ビューを編集する
          const texUserName = dialogElement.querySelector('[data-dlg-prop="userName"]');
          const numUserResidence = dialogElement.querySelector('[data-dlg-prop="userResidence"]');
          const numUserAge = dialogElement.querySelector('[data-dlg-prop="userAge"]');//data-dlg-prop="userName"
          const arrUserHobbies = dialogElement.querySelector('[data-dlg-multi-prop="userHobbies"]');//data-dlg-prop="userName"
          const booleanUserProtectionEnabled = dialogElement.querySelector('[data-dlg-prop="userProtectionEnabled"]');

          // 入力値を変更する
          texUserName.value = 'John Doh';
          numUserAge.value = 30;
          numUserResidence.value = 2;
          booleanUserProtectionEnabled.checked = false;

          // userHobbiesはこのダイアログそのものではなく、このダイアログで開いた
          // 別のダイアログで編集するのでここでは変更しない

          // Applyボタンをクリックする
          const btnApply = dialogElement.querySelector('[data-dlg-action="apply"]');
          btnApply.click();
        });

        // dialog1を表示する
        const button1 = document.querySelector('#button1');
        button1.click();


      }
    );//test

    test('[dialog1] no url no template error', async (done) => {
        const userData = getUserData();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        //ダイアログを開くときにダイアログのテンプレートHTMLを読み込む
        dialogMgr.setLoadTemplateOnOpen(true);

        //loadResourceFromUrl
        const stringsRes = await loadResourceFromUrl(`${SERVER_ENDPOINT}/res/strings.json`, 'json');

        await dialogMgr.setResourcesWithModel(stringsRes);
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          onCreate: (data) => {
          },
          onApply: (data) => {
          },
          onCancel: (data) => {
          },
        }).catch((err) => {
          expect(err.message).toContain('template or url property should be specified.')
          done();
        });


      }
    );//test

    test('[dialog1] network error', async (done) => {
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        dialogMgr.setLoadTemplateOnOpen(true);
        const stringsRes = await loadResourceFromUrl(`${SERVER_ENDPOINT}/res/strings.json`, 'json');
        await dialogMgr.setResourcesWithModel(stringsRes);
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `no-server`,
          onCreate: (data) => {
            data.dialog.context = {};
          },
        });//createDialog
        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化
        const dialogModel = dialogMgr.getDialogModelById('dlg-test-1');
        const dialogElement = dialogModel.element;
        dialogElement.addEventListener('hidden.bs.modal', (e) => {
        });
        dialogElement.addEventListener('shown.bs.modal', (e) => {
          // ビューが表示された
          expect(dialogElement.innerHTML).toContain('Network Error occurred.Please reload the page');
          done();
        });
        const button1 = document.querySelector('#button1');
        button1.click();
      }
    );//test

    test('[dialog1] network timeout error', async (done) => {
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        dialogMgr.setLoadTemplateOnOpen(true);
        const stringsRes = await loadResourceFromUrl(`${SERVER_ENDPOINT}/res/strings.json`, 'json');
        await dialogMgr.setResourcesWithModel(stringsRes);
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `${SERVER_ENDPOINT}/timeout`,
          onCreate: (data) => {
            data.dialog.context = {};
          },
        });//createDialog
        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化
        const dialogModel = dialogMgr.getDialogModelById('dlg-test-1');
        const dialogElement = dialogModel.element;
        dialogElement.addEventListener('hidden.bs.modal', (e) => {
        });
        dialogElement.addEventListener('shown.bs.modal', (e) => {
          // ビューが表示された
          expect(dialogElement.innerHTML).toContain('Network Timeout Error occurred');
          done();
        });
        const button1 = document.querySelector('#button1');
        button1.click();
      }
    );//test

  });// describe
  describe('createDialog()', () => {

    test('[dialog1]click to open dialog', async (done) => {
        document.body.innerHTML = INNER_HTML;

        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);

        const html = await loadResourceFromUrl(`${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`, 'text');

        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          //template: html
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素
            expect(dialogId).toBe('dlg-test-1');
            expect(dialogInstance.show).toBeTruthy();
            expect(dialogInstance.hide).toBeTruthy();
            expect(dialogInstance.toggle).toBeTruthy();
            expect(typeOf(dialogElement)).toBe('HTMLDivElement')
            expect(dialogContext).toBeNull();
            expect(dialogOpener).toBeTruthy();
            expect(dialogParams).toBeTruthy();
            expect(dialogCallback).toBeTruthy();
            expect(typeOf(dialogCallback.onCreate)).toBe('Function');
            expect(typeOf(dialogCallback.onApply)).toBe('Function');
            expect(typeOf(dialogCallback.onCancel)).toBe('Function');
            expect(typeOf(dialogCallback.onCancel)).toBe('Function');
            expect(dialogCallback.onAny).toBeUndefined();
            expect(dialogCallback.onResume).toBeUndefined();
            expect(dialogTemplate).toBe(html);
            expect(openerElement).toBeTruthy();
            expect(openerElement.id).toBe('button1');
            dialogModel.context = {};
            done();


          },
          onApply: (data) => {
          },
          onCancel: (data) => {
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const button1 = document.querySelector('#button1');
        button1.click();


      }
    );//test
    test('[dialog1]empty context after onCreate', async () => {
        document.body.innerHTML = INNER_HTML;

        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);

        const html = await loadResourceFromUrl(`${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`, 'text');

        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          //template: html
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {


          },
          onApply: (data) => {
          },
          onCancel: (data) => {
          },

        }).catch((err) => {

        });

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化
        expect(() => {
          dialogMgr.refreshDialog('dlg-test-1');
        }).toThrowError('context is falsy.');
      }
    );//test

    test('set template as String', async (done) => {
        document.body.innerHTML = INNER_HTML;

        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);

        const html = await loadResourceFromUrl(`${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`, 'text');

        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          template: html,

          onCreate: (data) => {
            const dialogModel = data.dialog;
            const dialogTemplate = dialogModel.template;
            expect(dialogTemplate).toBe(html);
            dialogModel.context = {};
            done();
          },
          onApply: (data) => {
          },
          onCancel: (data) => {
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const button1 = document.querySelector('#button1');
        button1.click();


      }
    );//test

    // コンテクストに設定したプロパティがviewとして正しく描画される
    test('[dialog1]values set context will be rendered on the view', async (done) => {
        document.body.innerHTML = INNER_HTML;

        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素


            dialogModel.context = {
              userName: 'TEST_USER_NAME',
              userResidence: 2,
              userAge: 3,
              userHobbies: [0, 1],
              userProtectionEnabled: true,
            };


          },
          onApply: (data) => {
          },
          onCancel: (data) => {
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-1');
        const dialogElement = dialogModel.element;
        // bootstrap4のイベント意味
        // show.bs.modal　インスタンスメソッドが呼び出されるとすぐに発生
        // shown.bs.modal　モーダルがユーザーに完全に表示されると発生します
        // hide.bs.modal　hideインスタンスメソッドが呼び出されるとすぐに発生
        // hidden.bs.modal　モーダルがユーザーから完全に非表示にされたときに発生します
        dialogElement.addEventListener('shown.bs.modal', (e) => {
          //完全に表示
          const texUserName = dialogElement.querySelector('[data-dlg-prop="userName"]');
          const numUserResidence = dialogElement.querySelector('[data-dlg-prop="userResidence"]');
          const numUserAge = dialogElement.querySelector('[data-dlg-prop="userAge"]');//data-dlg-prop="userName"
          const arrUserHobbies = dialogElement.querySelector('[data-dlg-multi-prop="userHobbies"]');//data-dlg-prop="userName"
          const booleanUserProtectionEnabled = dialogElement.querySelector('[data-dlg-prop="userProtectionEnabled"]');
          expect(texUserName.value).toBe('TEST_USER_NAME');
          expect((numUserResidence.value)).toBe('2');
          expect(Number(numUserResidence.value)).toBe(2);
          expect(Number(numUserAge.value)).toBe(3);
          expect(arrUserHobbies.value).toBe('swiming,golf');
          expect(booleanUserProtectionEnabled.checked).toBe(true);
          done();
        });

        const button1 = document.querySelector('#button1');
        button1.click();


      }
    );//test

    // フォーカスが正しくあたっている
    test('[dialog1]focus view', async (done) => {
        document.body.innerHTML = INNER_HTML;

        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素
            dialogModel.context = {
              userName: 'TEST_USER_NAME',
              userResidence: 2,
              userAge: 3,
              userHobbies: [0, 1],
              userProtectionEnabled: true,
            };
          },
          onApply: (data) => {
          },
          onCancel: (data) => {
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-1');
        const dialogElement = dialogModel.element;

        dialogElement.addEventListener('shown.bs.modal', (e) => {
          //完全に表示
          const texUserName = dialogElement.querySelector('[data-dlg-prop="userName"]');
          const numUserResidence = dialogElement.querySelector('[data-dlg-prop="userResidence"]');
          const numUserAge = dialogElement.querySelector('[data-dlg-prop="userAge"]');//data-dlg-prop="userName"
          const arrUserHobbies = dialogElement.querySelector('[data-dlg-multi-prop="userHobbies"]');//data-dlg-prop="userName"
          const booleanUserProtectionEnabled = dialogElement.querySelector('[data-dlg-prop="userProtectionEnabled"]');

          setTimeout(() => {
            // document.activeElement is a focused element
            expect(document.activeElement).toBe(texUserName);
            done();
          }, 600);

        });

        const button1 = document.querySelector('#button1');
        button1.click();


      }
    );//test

    // Inputでエンターキーをおすと、applyできる
    test('[dialog1]Enter to apply', async (done) => {
        document.body.innerHTML = INNER_HTML;

        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素


            dialogModel.context = {
              userName: 'TEST_USER_NAME',
              userResidence: 2,
              userAge: 3,
              userHobbies: [0, 1],
              userProtectionEnabled: true,
            };
          },
          onApply: (data) => {
            expect(data.dialog.context.userName).toBe('Riversun');
            done();
          },
          onCancel: (data) => {
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-1');
        const dialogElement = dialogModel.element;
        // bootstrap4のイベント意味
        // show.bs.modal　インスタンスメソッドが呼び出されるとすぐに発生
        // shown.bs.modal　モーダルがユーザーに完全に表示されると発生します
        // hide.bs.modal　hideインスタンスメソッドが呼び出されるとすぐに発生
        // hidden.bs.modal　モーダルがユーザーから完全に非表示にされたときに発生します
        dialogElement.addEventListener('shown.bs.modal', (e) => {
          //完全に表示
          const texUserName = dialogElement.querySelector('[data-dlg-prop="userName"]');
          const numUserResidence = dialogElement.querySelector('[data-dlg-prop="userResidence"]');
          const numUserAge = dialogElement.querySelector('[data-dlg-prop="userAge"]');//data-dlg-prop="userName"
          const arrUserHobbies = dialogElement.querySelector('[data-dlg-multi-prop="userHobbies"]');//data-dlg-prop="userName"
          const booleanUserProtectionEnabled = dialogElement.querySelector('[data-dlg-prop="userProtectionEnabled"]');
          expect(texUserName.value).toBe('TEST_USER_NAME');
          expect((numUserResidence.value)).toBe('2');
          expect(Number(numUserResidence.value)).toBe(2);
          expect(Number(numUserAge.value)).toBe(3);
          expect(arrUserHobbies.value).toBe('swiming,golf');
          expect(booleanUserProtectionEnabled.checked).toBe(true);


          texUserName.value = "Riversun";

          //let pressEnter = new KeyboardEvent( 'keypress', { key: 'Enter' });
          var pressEnter = document.createEvent('Events');
          pressEnter.initEvent('keypress', true, true);
          // pressEnter.keyCode = 13;
          // pressEnter.which = 13;
          // pressEnter.charCode = 13;
          // pressEnter.key = 'Enter';
          pressEnter.code = 'Enter';
          texUserName.dispatchEvent(pressEnter);

        });

        const button1 = document.querySelector('#button1');
        button1.click();


      }
    );//test
    // ダイアログを表示したあと、ビューに値を入力し値をApplyしたとっきContextに正しく反映されているかを確認する
    test('[dialog1]do apply', async (done) => {
        //After displaying the dialog,
        // enter a value in the view and apply the value to the previous context
        // to make sure it is reflected correctly.
        const userData = getUserData();

        document.body.innerHTML = INNER_HTML;

        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素

            dialogModel.context = {};

            const copyToPropNames = ['userResidence', 'userName', 'userAge', 'userHobbies', 'userProtectionEnabled'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);

          },
          onApply: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素

            const context = data.dialog.context;
            expect(context.userName).toBe('John Doh');
            expect(context.userResidence).toBe(2);
            expect(context.userAge).toBe(30);
            expect(context.userProtectionEnabled).toBe(false);


            // ダイアログを閉じる
            dialogInstance.hide();
          },
          onCancel: (data) => {
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-1');
        const dialogElement = dialogModel.element;

        dialogElement.addEventListener('hidden.bs.modal', (e) => {
          done();
        });

        dialogElement.addEventListener('shown.bs.modal', (e) => {
          // ビューが表示された

          // ビューを編集する
          const texUserName = dialogElement.querySelector('[data-dlg-prop="userName"]');
          const numUserResidence = dialogElement.querySelector('[data-dlg-prop="userResidence"]');
          const numUserAge = dialogElement.querySelector('[data-dlg-prop="userAge"]');//data-dlg-prop="userName"
          const arrUserHobbies = dialogElement.querySelector('[data-dlg-multi-prop="userHobbies"]');//data-dlg-prop="userName"
          const booleanUserProtectionEnabled = dialogElement.querySelector('[data-dlg-prop="userProtectionEnabled"]');

          // 入力値を変更する
          texUserName.value = 'John Doh';
          numUserAge.value = 30;
          numUserResidence.value = 2;
          booleanUserProtectionEnabled.checked = false;

          // userHobbiesはこのダイアログそのものではなく、このダイアログで開いた
          // 別のダイアログで編集するのでここでは変更しない

          // Applyボタンをクリックする
          const btnApply = dialogElement.querySelector('[data-dlg-action="apply"]');
          btnApply.click();
        });

        // dialog1を表示する
        const button1 = document.querySelector('#button1');
        button1.click();


      }
    );//test

    // ダイアログを表示したあと、ビューの値を変更しApplyした時、
    // バリデーションエラーで再表示されたとき、ビューの値は変更後をたもっていることを担保する
    test('[dialog1]do apply and validation error', async (done) => {
        //After displaying the dialog,
        // enter a value in the view and apply the value to the previous context
        // to make sure it is reflected correctly.
        const userData = getUserData();

        document.body.innerHTML = INNER_HTML;

        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素

            dialogModel.context = {};

            const copyToPropNames = ['userResidence', 'userName', 'userAge', 'userHobbies', 'userProtectionEnabled'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);

          },

          onApply: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素

            const context = data.dialog.context;
            expect(context.userName).toBe('John Doh');
            expect(context.userResidence).toBe(2);
            expect(context.userAge).toBe(1);
            expect(context.userProtectionEnabled).toBe(false);


            // 入力値の検証をおこなう
            const userAge = context.userAge;
            if (userAge < 18 || 60 < userAge) {

              //問題があればエラーメッセージを表示する
              // data-dlg-hidden="msg-for-userAge" のようにしておくことで、この属性がついている要素は
              // contextプロパティ"msg-for-userAge"に値が入らない限り表示されないようになる
              dialogModel.context['msg-for-userAge'] =
                { res: (userAge < 18) ? 'err-user-age-under' : (60 < userAge) ? 'err-user-age-over' : null };
              // このダイアログを再表示して、エラーが表示された状態にする


              // 1度目の表示の後、refreshDialogした結果を受け取る onShowをここでセットする
              dialogModel.callback.onShow = (data) => {

                // refresh Dialogしても、refresh前の入力値が変化していないことを確認
                const context = data.dialog.context;
                expect(context.userName).toBe('John Doh');
                expect(context.userResidence).toBe(2);
                expect(context.userAge).toBe(1);
                expect(context.userProtectionEnabled).toBe(false);

                done();
              };

              dialogMgr.refreshDialog('dlg-test-1');
              return;
            }

            dialogInstance.hide();

          },
          onCancel: (data) => {
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-1');
        const dialogElement = dialogModel.element;

        dialogElement.addEventListener('hidden.bs.modal', (e) => {
          throw Error('Should not be hidden');
        });

        dialogElement.addEventListener('shown.bs.modal', (e) => {
          // ビューが完全に表示された

          // ビューを編集する
          const texUserName = dialogElement.querySelector('[data-dlg-prop="userName"]');
          const numUserResidence = dialogElement.querySelector('[data-dlg-prop="userResidence"]');
          const numUserAge = dialogElement.querySelector('[data-dlg-prop="userAge"]');//data-dlg-prop="userName"
          const arrUserHobbies = dialogElement.querySelector('[data-dlg-multi-prop="userHobbies"]');//data-dlg-prop="userName"
          const booleanUserProtectionEnabled = dialogElement.querySelector('[data-dlg-prop="userProtectionEnabled"]');

          // 入力値を変更する
          texUserName.value = 'John Doh';
          numUserAge.value = 1;
          numUserResidence.value = 2;
          booleanUserProtectionEnabled.checked = false;

          // userHobbiesはこのダイアログそのものではなく、このダイアログで開いた
          // 別のダイアログで編集するのでここでは変更しない

          // Applyボタンをクリックする
          const btnApply = dialogElement.querySelector('[data-dlg-action="apply"]');
          btnApply.click();
        });

        // dialog1を表示する
        const button1 = document.querySelector('#button1');
        button1.click();


      }
    );//test

    // ダイアログ上からDATA-API連携でさらに新しいダイアログを開き
    // 新しいダイアログでの編集結果をもとのダイアログで受け取る
    test('[dialog1]open external dialog from dialog', async (done) => {
        const userData = getUserData();

        document.body.innerHTML = INNER_HTML;

        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);

        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const dialogOpener = dialogModel.opener;
            dialogModel.context = {};
            const copyToPropNames = ['userResidence', 'userName', 'userAge', 'userHobbies', 'userProtectionEnabled'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);
          },
          onApply: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const context = data.dialog.context;
            expect(context.userName).toBe('John Doh');
            expect(context.userResidence).toBe(2);
            expect(context.userAge).toBe(42);
            expect(context.userProtectionEnabled).toBe(false);

            // 入力値の検証をおこなう
            const userAge = context.userAge;
            if (userAge < 18 || 60 < userAge) {

              //問題があればエラーメッセージを表示する
              // data-dlg-hidden="msg-for-userAge" のようにしておくことで、この属性がついている要素は
              // contextプロパティ"msg-for-userAge"に値が入らない限り表示されないようになる
              dialogModel.context['msg-for-userAge'] =
                { res: (userAge < 18) ? 'err-user-age-under' : (60 < userAge) ? 'err-user-age-over' : null };
              // このダイアログを再表示して、エラーが表示された状態にする

              dialogMgr.refreshDialog('dlg-test-1');
              return;
            }

            dialogMgr.bindModelFromContext(userData, data.dialog.context);

            dialogInstance.hide();

            // applyした後に、contextがuserDataに反映されていることを確認
            expect(userData.userName).toBe('John Doh');
            expect(userData.userResidence).toBe(2);
            expect(userData.userAge).toBe(42);
            expect(userData.userProtectionEnabled).toBe(false);
            expect(userData.userHobbies).toEqual([0, 3, 4]);

            done();
          },
          onCancel: (data) => {
          },
          onResume: (data) => {
            //{ dialog: dialogModel, resume: resumeData }
            const dialog = data.dialog;
            const resumeData = data.resume;
            const openerKey = resumeData.openerKey;
            const prevDialogModel = resumeData.dialogModel;

            const context = data.dialog.context;
            //1回目にダイアログが表示されたときに、変更したビューが新たなダイアログを開いて帰ってきたあとも維持されていることを確認する
            expect(context.userName).toBe('John Doh');
            expect(context.userResidence).toBe(2);
            expect(context.userAge).toBe(42);
            expect(context.userProtectionEnabled).toBe(false);
            expect(context.userHobbies).toEqual([0, 3, 4]);

            setTimeout(() => {
              const applyBtn = mainDialogEle.querySelector('[data-dlg-action="apply"]');
              applyBtn.click();

            }, 100);
          }
        });//createDialog

        // 複数選択チェックボックスを、i18nリソースを参照して表示するデモ
        await dialogMgr.createDialog({
          id: 'dlg-test-1-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-1-multi-selection-inputs.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const context = dialogModel.context;//ダイアログの入力状態
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

            // ここでcontextをあえてセットしない。なぜなら前のcontextがセットされてひらかれるから。


          },
          onApply: (data) => {
            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const context = dialogModel.context;//ダイアログの入力状態
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

            dialogInstance.hide();

          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
          },

        });


        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        let testCounter = 0;

        const mainDialogModel = dialogMgr.getDialogModelById('dlg-test-1');
        const mainDialogEle = mainDialogModel.element;

        const subDialogModel = dialogMgr.getDialogModelById('dlg-test-1-1');
        const subDialogEle = subDialogModel.element;


        mainDialogEle.addEventListener('shown.bs.modal', (e) => {
          //　メインダイアログが表示されたタイミング

          if (testCounter === 0) {//無限ループにならないようにカウンターで初回判定
            const texUserName = mainDialogEle.querySelector('[data-dlg-prop="userName"]');
            const numUserResidence = mainDialogEle.querySelector('[data-dlg-prop="userResidence"]');
            const numUserAge = mainDialogEle.querySelector('[data-dlg-prop="userAge"]');//data-dlg-prop="userName"
            const arrUserHobbies = mainDialogEle.querySelector('[data-dlg-multi-prop="userHobbies"]');//data-dlg-prop="userName"
            const booleanUserProtectionEnabled = mainDialogEle.querySelector('[data-dlg-prop="userProtectionEnabled"]');

            texUserName.value = 'John Doh';
            numUserAge.value = 42;
            numUserResidence.value = 2;
            booleanUserProtectionEnabled.checked = false;


            // 編集ボタンをクリックしてサブダイアログを表示する
            const btnEdit = mainDialogEle.querySelector('button[data-dlg-key="userHobbies"]');// dialog1の「趣味の編集」ボタンをクリックする
            btnEdit.click();
            testCounter++;
          } else {
            // 2回目以降の表示
          }

        });
        mainDialogEle.addEventListener('hidden.bs.modal', (e) => {
          // チェックボックスダイアログが開くとき、元のダイアログはいったん閉じられるので、
          // ここはとくに処理につかわない
        });

        subDialogEle.addEventListener('shown.bs.modal', (e) => {
          // チェックボックスダイアログが開く
          const cb0 = subDialogEle.querySelector('#check-hobbies--0');
          const cb1 = subDialogEle.querySelector('#check-hobbies--1');
          const cb2 = subDialogEle.querySelector('#check-hobbies--2');
          const cb3 = subDialogEle.querySelector('#check-hobbies--3');
          const cb4 = subDialogEle.querySelector('#check-hobbies--4');
          const cb5 = subDialogEle.querySelector('#check-hobbies--5');

          // 元ダイアログのコンテクストが、このダイアログに反映されていることを確認
          expect(cb0.checked).toBe(false);
          expect(cb1.checked).toBe(true);
          expect(cb2.checked).toBe(true);
          expect(cb3.checked).toBe(true);
          expect(cb4.checked).toBe(false);
          expect(cb5.checked).toBe(false);

          // このダイアログのチェックボックスの状態を変更する
          cb0.checked = true;
          cb1.checked = false;
          cb2.checked = false;
          cb3.checked = true;
          cb4.checked = true;


          const btnOk = subDialogEle.querySelector('[data-dlg-action="apply"]');// dialog11のOKボタン
          btnOk.click();

        });

        //index.htmlのダイアログ起動ボタン
        const button1 = document.querySelector('#button1');
        button1.click();


      }
    );//test

    // 日付処理ダイアログテスト(英語)
    test('[dialog2] datetime in dialog', async (done) => {
        const userData = getUserData();

        document.body.innerHTML = INNER_HTML;

        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);

        /**
         * 日付関連処理のデモダイアログ
         */
        await dialogMgr.createDialog({
          id: 'dlg-test-2',
          url: `${SERVER_ENDPOINT}/view/dlg-test-2-date-inputs.html`,
          onCreate: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const openerElement = opener.element;// DATA-APIによってダイアログを開いた要素
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogElement = dialogModel.element;
            // i18resで指定されている場合は同名のラベル
            data.dialog.context = {};
            const copyToPropNames = ['userBirthday', 'userStartTime', 'userWakeUpTime'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);


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

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const mainDialogModel = dialogMgr.getDialogModelById('dlg-test-2');
        const mainDialogEle = mainDialogModel.element;
        mainDialogEle.addEventListener('shown.bs.modal', (e) => {
          const textUserBirthday = mainDialogEle.querySelector('[data-dlg-prop="userBirthday"]');
          const textUserWakeUpTime = mainDialogEle.querySelector('[data-dlg-prop="userWakeUpTime"]');
          const texUserStartTime = mainDialogEle.querySelector('[data-dlg-prop="userStartTime"]');
          expect(textUserBirthday.value).toBe('2010-04-01');
          expect(textUserWakeUpTime.value).toBe('08:00');
          expect(texUserStartTime.value).toBe('01-02-2020 02:34');
          done();
        });

        //index.htmlのダイアログ起動ボタン
        const button2 = document.querySelector('#button2');
        button2.click();
      }
    );//test

    // 日付処理ダイアログテスト(日本語)
    test('[dialog2] datetime in dialog in Japanese', async (done) => {
        const userData = getUserData();

        document.body.innerHTML = INNER_HTML;

        const dialogMgr = createDlgMgr();
        dialogMgr.setLocale('ja');
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);

        /**
         * 日付関連処理のデモダイアログ
         */
        await dialogMgr.createDialog({
          id: 'dlg-test-2',
          url: `${SERVER_ENDPOINT}/view/dlg-test-2-date-inputs.html`,
          onCreate: (data) => {

            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const openerElement = opener.element;// DATA-APIによってダイアログを開いた要素
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogElement = dialogModel.element;
            // i18resで指定されている場合は同名のラベル
            data.dialog.context = {};
            const copyToPropNames = ['userBirthday', 'userStartTime', 'userWakeUpTime'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);


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

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const mainDialogModel = dialogMgr.getDialogModelById('dlg-test-2');
        const mainDialogEle = mainDialogModel.element;
        mainDialogEle.addEventListener('shown.bs.modal', (e) => {
          const textUserBirthday = mainDialogEle.querySelector('[data-dlg-prop="userBirthday"]');
          const textUserWakeUpTime = mainDialogEle.querySelector('[data-dlg-prop="userWakeUpTime"]');
          const texUserStartTime = mainDialogEle.querySelector('[data-dlg-prop="userStartTime"]');
          expect(textUserBirthday.value).toBe('2010年04月01日(木)');
          expect(textUserWakeUpTime.value).toBe('08時00分');
          expect(texUserStartTime.value).toBe('2020年01月02日(木) 02時34分');
          done();
        });

        //index.htmlのダイアログ起動ボタン
        const button2 = document.querySelector('#button2');
        button2.click();
      }
    );//test

    // data-dlg-ref-id属性、data-dlg-ref-disp属性でオブジェクト型のリソースを（リソースでなく）「自分」で詰めて
    // 想定どおり動作することを確認する
    test('[dialog3] multi selection checkboxes with object model', async (done) => {
        const userData = getUserData();
        const friends = getFriends();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        await dialogMgr.createDialog({
          id: 'dlg-test-3',
          url: `${SERVER_ENDPOINT}/view/dlg-test-3-checkbox-multi.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            dialogModel.context = {
              // modelには、i18リソースを使うときのプレースホルダ変数を格納できる。リソース名は'label-title'
              'label-title': { model: { 'user-name': "Tom" } },
              //選択肢で参照させる
              userNames: friends,
            };
            const copyToPropNames = ['userFriends'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);
          },
          onApply: (data) => {
            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const context = dialogModel.context;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            expect(data.dialog.context.userFriends).toEqual(['person_03', 'person_04', 'person_05', 'person_06']);
            const copyToPropNames = ['userFriends'];
            dialogMgr.bindModelFromContext(
              userData, data.dialog.context, copyToPropNames);
            dialogInstance.hide();
            expect(userData.userFriends).toEqual(['person_03', 'person_04', 'person_05', 'person_06']);
            let userFriendStr = '';
            for (let friend of friends) {
              if (userData.userFriends.includes(friend.id)) {
                userFriendStr += friend.name + ' ';
              }
            }
            expect(userFriendStr).toBe('ベル ドナルド アリエル ジャスミン ');
            done();
          },
          onCancel: (data) => {
          },
          onResume: (data) => {
          },
          onAny: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            const openerElement = opener ? opener.element : null;
            dialogInstance.hide();
            if (openerElement) {
              openerElement.value = `アクション:${data.action}`
            }
          }
        });

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const mainDialogModel = dialogMgr.getDialogModelById('dlg-test-3');
        const mainDialogEle = mainDialogModel.element;

        mainDialogEle.addEventListener('shown.bs.modal', (e) => {
          //　メインダイアログが表示されたタイミング
          const cb1 = mainDialogEle.querySelector('#check-userNames--person_01');
          const cb2 = mainDialogEle.querySelector('#check-userNames--person_02');
          const cb3 = mainDialogEle.querySelector('#check-userNames--person_03');
          const cb4 = mainDialogEle.querySelector('#check-userNames--person_04');
          const cb5 = mainDialogEle.querySelector('#check-userNames--person_05');
          const cb6 = mainDialogEle.querySelector('#check-userNames--person_06');

          // 元ダイアログのコンテクストが、このダイアログに反映されていることを確認
          expect(cb1.checked).toBe(false);
          expect(cb2.checked).toBe(false);
          expect(cb3.checked).toBe(true);
          expect(cb4.checked).toBe(false);
          expect(cb5.checked).toBe(false);
          expect(cb6.checked).toBe(true);

          // このダイアログのチェックボックスの状態を変更する
          cb1.checked = false;
          cb2.checked = false;
          cb3.checked = true;
          cb4.checked = true;
          cb5.checked = true;
          cb6.checked = true;

          const btnApply = mainDialogEle.querySelector('[data-dlg-action="apply"]');
          btnApply.click();
        });

        //index.htmlのダイアログ起動ボタン
        const text3 = document.querySelector('#text3');
        text3.click();

      }
    );//test


    // dialo3でonAnyが正しく動作することを確認する
    test('[dialog3] test onAny', async (done) => {
        const userData = getUserData();
        const friends = getFriends();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        await dialogMgr.createDialog({
          id: 'dlg-test-3',
          url: `${SERVER_ENDPOINT}/view/dlg-test-3-checkbox-multi.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            dialogModel.context = {
              userNames: friends,
            };
            const copyToPropNames = ['userFriends'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);
          },
          onApply: (data) => {
          },
          onCancel: (data) => {
          },
          onResume: (data) => {
          },
          onAny: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
            expect(data.action).toBe('something');
            done();
          }
        });
        dialogMgr.activate();
        BSN.initCallback();
        const mainDialogModel = dialogMgr.getDialogModelById('dlg-test-3');
        const mainDialogEle = mainDialogModel.element;
        mainDialogEle.addEventListener('shown.bs.modal', (e) => {
          const btnSomething = mainDialogEle.querySelector('[data-dlg-action="something"]');
          btnSomething.click();
        });
        //index.htmlのダイアログ起動ボタン
        const text3 = document.querySelector('#text3');
        text3.click();
      }
    );//test
    // dialo3でonCancelが正しく動作することを確認する
    test('[dialog3] test onCancel', async (done) => {
        const userData = getUserData();
        const friends = getFriends();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        await dialogMgr.createDialog({
          id: 'dlg-test-3',
          url: `${SERVER_ENDPOINT}/view/dlg-test-3-checkbox-multi.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            dialogModel.context = {
              userNames: friends,
            };
            const copyToPropNames = ['userFriends'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);
          },
          onApply: (data) => {
          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();

            done();
          },
          onResume: (data) => {
          },
          onAny: (data) => {

          }
        });
        dialogMgr.activate();
        BSN.initCallback();
        const mainDialogModel = dialogMgr.getDialogModelById('dlg-test-3');
        const mainDialogEle = mainDialogModel.element;
        mainDialogEle.addEventListener('shown.bs.modal', (e) => {
          const btnCancel = mainDialogEle.querySelector('[data-dlg-action="cancel"]');
          btnCancel.click();
        });
        //index.htmlのダイアログ起動ボタン
        const text3 = document.querySelector('#text3');
        text3.click();
      }
    );//test


    // dialo8でradio buttonが正しく動作することを確認する
    test('[dialog8] test radio button', async (done) => {
        const userData = getUserData();

        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        await dialogMgr.createDialog({
          id: 'dlg-test-8',
          url: `${SERVER_ENDPOINT}/view/dlg-test-8-radio-single.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            dialogModel.context = {};
            const copyToPropNames = ['userDegree'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);
          },
          onApply: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素


            const copyToPropNames = ['userDegree'];
            dialogMgr.bindModelFromContext(
              userData, data.dialog.context, copyToPropNames);

            dialogInstance.hide();

            //選択したデータで元のセルの内容を更新
            if (openerElement) {
              openerElement.value = '';
              // 内部でよければgetListingInputDispDataMap メソッドつかってもOK
              for (const prefObj of dialogMgr.t('degrees')) {
                if (prefObj.id === userData.userDegree) {
                  openerElement.value = prefObj.name;
                }
              }
            }

            expect(openerElement.value).toBe('College');
            expect(userData.userDegree).toBe('deg_college');
            done();
          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();


          },
          onResume: (data) => {
          },
          onAny: (data) => {

          }
        });
        dialogMgr.activate();
        BSN.initCallback();
        const mainDialogModel = dialogMgr.getDialogModelById('dlg-test-8');
        const mainDialogEle = mainDialogModel.element;

        mainDialogEle.addEventListener('shown.bs.modal', (e) => {
          setTimeout(() => {

            // ダイアログ起動時はdeg_highがチェックされている
            const degHightRadioEle = mainDialogEle.querySelector('#radio-degrees--deg_high');
            expect(degHightRadioEle.checked).toBe(true);

            // ダイアログ上でdeg_collegeのラジオボタンをチェックする
            const degCollegeRadioEle = mainDialogEle.querySelector('#radio-degrees--deg_college');
            degCollegeRadioEle.checked = true;

            const btnOK = mainDialogEle.querySelector('[data-dlg-action="apply"]');
            btnOK.click();
          }, 500);


        });
        //index.htmlのダイアログ起動ボタン
        const text3 = document.querySelector('#text8');
        text3.click();
      }
    );//test
  });// describe
  describe('deleteDialog()', () => {
    test('[dialog1]delete dialog', async () => {
        const userData = getUserData();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素

            dialogModel.context = {};

            const copyToPropNames = ['userResidence', 'userName', 'userAge', 'userHobbies', 'userProtectionEnabled'];
            dialogMgr.bindModelToContext(
              userData, dialogModel.context, copyToPropNames);

          },
          onApply: (data) => {
          },
          onCancel: (data) => {
          },

        });//createDialog
        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化
        expect(dialogMgr.getDialogModelById('dlg-test-1')).toBeTruthy();
        //削除の確認
        dialogMgr.deleteDialog('dlg-test-1');
        expect(dialogMgr.getDialogModelById('dlg-test-1')).toBeFalsy();

        // re-delete
        expect(dialogMgr.deleteDialog('dlg-test-1')).toBe(false);
      }
    );//test
  });// describe
  describe('showDialog()', () => {
    test('[dialog1]showDialog', async (done) => {
        const userData = getUserData();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-1-general-inputs.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const dialogTemplate = dialogModel.template;
            const dialogElement = dialogModel.element;
            const dialogInstance = dialogModel.instance;//BSNダイアログのインスタンス
            const dialogContext = dialogModel.context;
            const dialogOpener = dialogModel.opener;
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト
            const dialogCallback = dialogModel.callback;
            const openerElement = dialogOpener ? dialogOpener.element : null;// DATA-APIによってダイアログを開いた要素


            expect(dialogContext.exampleKey).toBe('exampleValue');
            done();

          },
          onApply: (data) => {
          },
          onCancel: (data) => {
          },

        });//createDialog
        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        dialogMgr.showDialog('dlg-test-1', { context: { exampleKey: 'exampleValue' } });

      }
    );//test

    // showDialogで開いた先のダイアログ(returnable:true)の結果を取得する(applyの結果を取得)
    test('[dialog9]show external dialog from dialog and get "apply"', async (done) => {
        const friends = getFriends();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        await dialogMgr.createDialog({
          id: 'dlg-test-9',
          url: `${SERVER_ENDPOINT}/view/dlg-test-9-show-external-dialog.html`,
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
            // showDialogで開いたダイアログの結果を取得する
            const dlgResult = await dialogMgr.showDialog('dlg-test-9-1', { params: { personId: context.personId } });

            expect(dlgResult.action).toBe('apply');

            if (dlgResult.action === 'apply') {
              // 適用がクリックされた場合
              dialogInstance.hide();
              const selectedUserResidence = dlgResult.result.userResidence;
              expect(selectedUserResidence).toBe(2);
              done();
            } else {
              // 適用されなかったので、ふたたびこのダイアログを開いてユーザー入力を促す
              dialogInstance.show();
            }
          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
          },
        });
        await dialogMgr.createDialog({
          id: 'dlg-test-9-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-9-1-general-inputs.html`,
          returnable: true,//returnable:trueにすると、呼び出し側のshowDialogに返値を渡せる
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

            const selectedPerson = friends.find(data => data.id == dialogParams.personId);

            // context内の同名のプロパティが初期値としてあてがわれる

            dialogModel.context = {
              // modelには、i18リソースを使うときのプレースホルダ変数を格納できる。リソース名は'label-title'
              'label-title': { model: { 'user-name': selectedPerson.name } },
              'userResidence': 2,
            };
          },

          onApply: (data) => {
            const dialogModel = data.dialog;
            //const mgr = dialogModel.dialogManager;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const context = dialogModel.context;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
            // 明示的にreturnすると、その値を返すことができる
            return { userResidence: context['userResidence'] };

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
        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        dialogMgr.showDialog('dlg-test-9');

        const mainDialogModel = dialogMgr.getDialogModelById('dlg-test-9');
        const mainDialogEle = mainDialogModel.element;

        const subDialogModel = dialogMgr.getDialogModelById('dlg-test-9-1');
        const subDialogEle = subDialogModel.element;

        subDialogEle.addEventListener('shown.bs.modal', (e) => {

          const btnOK = subDialogEle.querySelector('[data-dlg-action="apply"]');
          btnOK.click();
        });

        mainDialogEle.addEventListener('shown.bs.modal', (e) => {
          setTimeout(() => {
            const btnOK = mainDialogEle.querySelector('[data-dlg-action="apply"]');
            btnOK.click();
          }, 500);
        });
      }
    );//test

    // showDialogで開いた先のダイアログ(returnable:true)の結果を取得する(cancelを取得)
    test('[dialog9]show external dialog from dialog and get "cancel"', async (done) => {
        const friends = getFriends();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        await dialogMgr.createDialog({
          id: 'dlg-test-9',
          url: `${SERVER_ENDPOINT}/view/dlg-test-9-show-external-dialog.html`,
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
            // showDialogで開いたダイアログの結果を取得する
            const dlgResult = await dialogMgr.showDialog('dlg-test-9-1', { params: { personId: context.personId } });

            expect(dlgResult.action).toBe('cancel');

            if (dlgResult.action === 'apply') {
              // 適用がクリックされた場合
              dialogInstance.hide();


            } else {
              // 適用されなかったので、ふたたびこのダイアログを開いてユーザー入力を促す
              dialogInstance.show();
              done();
            }
          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
          },
        });
        await dialogMgr.createDialog({
          id: 'dlg-test-9-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-9-1-general-inputs.html`,
          returnable: true,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

            const selectedPerson = friends.find(data => data.id == dialogParams.personId);

            // context内の同名のプロパティが初期値としてあてがわれる

            dialogModel.context = {
              // modelには、i18リソースを使うときのプレースホルダ変数を格納できる。リソース名は'label-title'
              'label-title': { model: { 'user-name': selectedPerson.name } },
              'userResidence': 2,
            };
          },

          onApply: (data) => {
            const dialogModel = data.dialog;
            //const mgr = dialogModel.dialogManager;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const context = dialogModel.context;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
            // 明示的にreturnすると、その値を返すことができる
            return { userResidence: context['userResidence'] };

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
            return {}; // returnableでキャンセルをしたときにも、戻り値を受け取りたい場合には return;ではなくreturn {} する。
          },
        });
        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        dialogMgr.showDialog('dlg-test-9');

        const mainDialogModel = dialogMgr.getDialogModelById('dlg-test-9');
        const mainDialogEle = mainDialogModel.element;

        const subDialogModel = dialogMgr.getDialogModelById('dlg-test-9-1');
        const subDialogEle = subDialogModel.element;

        subDialogEle.addEventListener('shown.bs.modal', (e) => {

          const btnCancel = subDialogEle.querySelector('[data-dlg-action="cancel"]');
          btnCancel.click();
        });

        mainDialogEle.addEventListener('shown.bs.modal', (e) => {
          setTimeout(() => {
            const btnOK = mainDialogEle.querySelector('[data-dlg-action="apply"]');
            btnOK.click();
          }, 500);
        });
      }
    );//test

    // showDialogで開いた先のダイアログでさらにYesNoダイアログを開いてOKをおすと、"delete"アクションとして返ってくる
    test('[dialog9]show external dialog from dialog and get "delete"', async (done) => {
        const friends = getFriends();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        await dialogMgr.createDialog({
          id: 'dlg-test-9',
          url: `${SERVER_ENDPOINT}/view/dlg-test-9-show-external-dialog.html`,
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
            // showDialogで開いたダイアログの結果を取得する
            const dlgResult = await dialogMgr.showDialog('dlg-test-9-1', { params: { personId: context.personId } });

            expect(dlgResult.action).toBe('delete');

            if (dlgResult.action === 'apply') {
              dialogInstance.hide();
              const selectedUserResidence = dlgResult.result.userResidence;
              // 適用されたのでダイアログを閉じた状態のままおわり
            } else if (dlgResult.action === 'cancel') {
              // 適用されなかったので、ふたたびこのダイアログを開いてユーザー入力を促す
              dialogInstance.show();
            } else if (dlgResult.action === 'delete') {
              dialogInstance.hide();
              done();
            }

          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
          },
        });
        await dialogMgr.createDialog({
          id: 'dlg-test-9-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-9-1-general-inputs.html`,
          returnable: true,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

            const selectedPerson = friends.find(data => data.id == dialogParams.personId);

            // context内の同名のプロパティが初期値としてあてがわれる

            dialogModel.context = {
              // modelには、i18リソースを使うときのプレースホルダ変数を格納できる。リソース名は'label-title'
              'label-title': { model: { 'user-name': selectedPerson.name } },
              'userResidence': 2,
            };
          },

          onApply: (data) => {
            const dialogModel = data.dialog;
            //const mgr = dialogModel.dialogManager;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const context = dialogModel.context;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
            // 明示的にreturnすると、その値を返すことができる
            return { userResidence: context['userResidence'] };

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
            return {}; // returnableでキャンセルをしたときにも、戻り値を受け取りたい場合には return;ではなくreturn {} する。
          },
          onAny: async (data) => {
            const dialogModel = data.dialog;
            const params = dialogModel.params;
            //const person = params.person;
            const opener = dialogModel.opener;
            const dialogInstance = dialogModel.instance;

            // 通常は値をreturnすればそれがresultとして、dialog-example9側に渡されるが、
            // なにかのアクションを待ちたい場合に、 promiseを返しても良い
            return new Promise(async (resolve) => {
              if (data.action === 'delete') {

                // 「本当に削除して良いか」ダイアログを開く
                const opt = {
                  type: 'yesno',
                  title: 'Deletion ?',
                  message: 'You really want to delete?',
                };
                const result = await dialogMgr.showConfirmation(opt);

                if (result === 'positive') {
                  // resolve(値：値は省略するとresultがundefinedになって返る)することで
                  // onAnyのdeleteとしてこのダイアログが閉じられdialog-example9に戻る
                  dialogInstance.hide();
                  resolve({});// return;ではだめで、何らかtruthyになるように　「{}」 を返す

                } else {
                  // YES/NOダイアログでキャンセルされた場合は、
                  // まだこのダイアログに居座るため、onAny(delete)をdialog-example9にもどらないようにする
                  // そのため、resolveでcancel:trueにする
                  dialogInstance.show();
                  resolve({ cancel: true });
                }

              }
            });// promise

          }
        });
        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        dialogMgr.showDialog('dlg-test-9');

        const mainDialogModel = dialogMgr.getDialogModelById('dlg-test-9');
        const mainDialogEle = mainDialogModel.element;

        const subDialogModel = dialogMgr.getDialogModelById('dlg-test-9-1');
        const subDialogEle = subDialogModel.element;


        subDialogEle.addEventListener('shown.bs.modal', (e) => {

          const nextShowingConfirmationDialogId = dialogMgr.getNextConfirmationDialogId();

          const btnDelete = subDialogEle.querySelector('[data-dlg-action="delete"]');
          // delete確認ダイアログを開く
          btnDelete.click();


          setTimeout(() => {

            // delete確認ダイアログが開いたら、そのeleを取得する
            const confirmationDialogModel = dialogMgr.getDialogModelById(nextShowingConfirmationDialogId);
            const confirmationDialogEle = confirmationDialogModel.element;
            // 確認ダイアログのapplyボタンをクリックする。

            const btnConfirmOk = confirmationDialogEle.querySelector('[data-dlg-action="apply"]');
            btnConfirmOk.click();

          }, 250);


        });

        mainDialogEle.addEventListener('shown.bs.modal', (e) => {
          setTimeout(() => {
            const btnOK = mainDialogEle.querySelector('[data-dlg-action="apply"]');
            btnOK.click();
          }, 500);
        });
      }
    );//test

    // showDialogで開いた先のダイアログでさらにYesNoダイアログを開いてCancelをおすと、"delete"アクションとしては返らず、元のダイアログが開く
    test('[dialog9]show external dialog from dialog and get "delete" cancel', async (done) => {
        let subDialogShowCounter = 0;
        const friends = getFriends();
        document.body.innerHTML = INNER_HTML;
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);
        await dialogMgr.createDialog({
          id: 'dlg-test-9',
          url: `${SERVER_ENDPOINT}/view/dlg-test-9-show-external-dialog.html`,
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
            // showDialogで開いたダイアログの結果を取得する
            const dlgResult = await dialogMgr.showDialog('dlg-test-9-1', { params: { personId: context.personId } });

            expect(dlgResult.action).toBe('delete');

            if (dlgResult.action === 'apply') {
              dialogInstance.hide();
              const selectedUserResidence = dlgResult.result.userResidence;
              // 適用されたのでダイアログを閉じた状態のままおわり
            } else if (dlgResult.action === 'cancel') {
              // 適用されなかったので、ふたたびこのダイアログを開いてユーザー入力を促す
              dialogInstance.show();
            } else if (dlgResult.action === 'delete') {
              dialogInstance.hide();

            }

          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
          },
        });
        await dialogMgr.createDialog({
          id: 'dlg-test-9-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-9-1-general-inputs.html`,
          returnable: true,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const openerElement = opener ? opener.element : null;// DATA-APIによってダイアログを開いた要素
            const dialogParams = dialogModel.params;//extraなパラメータ格納用オブジェクト

            const selectedPerson = friends.find(data => data.id == dialogParams.personId);

            // context内の同名のプロパティが初期値としてあてがわれる

            dialogModel.context = {
              // modelには、i18リソースを使うときのプレースホルダ変数を格納できる。リソース名は'label-title'
              'label-title': { model: { 'user-name': selectedPerson.name } },
              'userResidence': 2,
            };
          },

          onApply: (data) => {
            const dialogModel = data.dialog;
            //const mgr = dialogModel.dialogManager;
            const dialogId = dialogModel.id;
            const opener = dialogModel.opener;
            const context = dialogModel.context;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
            // 明示的にreturnすると、その値を返すことができる
            return { userResidence: context['userResidence'] };

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
          onAny: async (data) => {
            const dialogModel = data.dialog;
            const params = dialogModel.params;
            //const person = params.person;
            const opener = dialogModel.opener;
            const dialogInstance = dialogModel.instance;

            // 通常は値をreturnすればそれがresultとして、dialog-example9側に渡されるが、
            // なにかのアクションを待ちたい場合に、 promiseを返しても良い
            return new Promise(async (resolve) => {
              if (data.action === 'delete') {

                // 「本当に削除して良いか」ダイアログを開く
                const opt = {
                  type: 'yesno',
                  title: 'Deletion ?',
                  message: 'You really want to delete?',
                };
                const result = await dialogMgr.showConfirmation(opt);

                if (result === 'positive') {
                  // resolve(値：値は省略するとresultがundefinedになって返る)することで
                  // onAnyのdeleteとしてこのダイアログが閉じられdialog-example9に戻る
                  dialogInstance.hide();
                  resolve();

                } else {
                  // YES/NOダイアログでキャンセルされた場合は、
                  // まだこのダイアログに居座るため、onAny(delete)をdialog-example9にもどらないようにする
                  // そのため、resolveでcancel:trueにする
                  dialogInstance.show();
                  resolve({ cancel: true });
                }

              }
            });// promise

          }
        });
        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        dialogMgr.showDialog('dlg-test-9');

        const mainDialogModel = dialogMgr.getDialogModelById('dlg-test-9');
        const mainDialogEle = mainDialogModel.element;

        const subDialogModel = dialogMgr.getDialogModelById('dlg-test-9-1');
        const subDialogEle = subDialogModel.element;


        subDialogEle.addEventListener('shown.bs.modal', (e) => {

          subDialogShowCounter++;

          if (subDialogShowCounter == 2) {
            // Yes/NoでCancelが押されると、{cancel:true}をresultとして返すので、
            // 自動的にダイアログ9-1がonAny(delete)をダイアログ9に返却することがなくなり
            // 再度ダイアログ9-1が表示される。そのためsubDialogShowCounterが2となるので、これが正常動作となる。
            done();
          }

          const nextShowingConfirmationDialogId = dialogMgr.getNextConfirmationDialogId();

          const btnDelete = subDialogEle.querySelector('[data-dlg-action="delete"]');
          // delete確認ダイアログを開く
          btnDelete.click();


          setTimeout(() => {

            // delete確認ダイアログが開いたら、そのeleを取得する
            const confirmationDialogModel = dialogMgr.getDialogModelById(nextShowingConfirmationDialogId);
            const confirmationDialogEle = confirmationDialogModel.element;
            // 確認ダイアログのapplyボタンをクリックする。

            const btnConfirmCancel = confirmationDialogEle.querySelector('[data-dlg-action="cancel"]');
            btnConfirmCancel.click();

          }, 250);


        });

        mainDialogEle.addEventListener('shown.bs.modal', (e) => {
          setTimeout(() => {
            const btnOK = mainDialogEle.querySelector('[data-dlg-action="apply"]');
            btnOK.click();
          }, 500);
        });
      }
    );//test
  });// describe
  describe('DATA-API auto-focus', () => {

    // data-dlg-focus が指定されており、かつvalueが空なら、発見された最初の要素にフォーカスがいく
    test('Auto focus on the first empty input element', async (done) => {
        document.body.innerHTML = INNER_HTML;
        const userNameData = {
          userFirstName: null,
          userLastName: '',
          userMiddleName: null,
        }
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);

        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-7',
          url: `${SERVER_ENDPOINT}/view/dlg-test-7-control-auto-focus.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            dialogModel.context = {};
            dialogMgr.bindModelToContext(
              userNameData, dialogModel.context);
          },
          onApply: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogMgr.bindModelFromContext(
              userNameData, data.dialog.context);
            dialogInstance.hide();
          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-7');
        const dialogElement = dialogModel.element;
        dialogElement.addEventListener('shown.bs.modal', (e) => {
          // ダイアログが表示された
          const userFirstNameEle = document.querySelector('[data-dlg-prop="userFirstName"]');
          const userLastNameEle = document.querySelector('[data-dlg-prop="userLastName"]');
          const userMiddleNameEle = document.querySelector('[data-dlg-prop="userMiddleName"]');
          setTimeout(() => {
            // document.activeElement is a focused element
            expect(document.activeElement).toBe(userFirstNameEle);
            expect(document.activeElement === userFirstNameEle).toBe(true);
            done();
          }, 600);
        });

        const button1 = document.querySelector('[data-dlg="dlg-test-7"]');
        button1.click();


      }
    );//test

    // data-dlg-focus が指定されており、かつvalueが指定されていない要素のうち先頭のもにフォーカスがいく
    test('Auto focus on the first empty input element no2', async (done) => {

        document.body.innerHTML = INNER_HTML;
        const userNameData = {
          userFirstName: 'Tom',
          userLastName: '',
          userMiddleName: null,
        }
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);

        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-7-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-7-control-auto-focus.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            dialogModel.context = {};
            dialogMgr.bindModelToContext(
              userNameData, dialogModel.context);
          },
          onApply: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogMgr.bindModelFromContext(
              userNameData, data.dialog.context);
            dialogInstance.hide();
          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-7-1');
        const dialogElement = dialogModel.element;
        dialogElement.addEventListener('shown.bs.modal', (e) => {
          // ダイアログが表示された
          const userFirstNameEle = document.querySelector('[data-dlg-prop="userFirstName"]');
          const userLastNameEle = document.querySelector('[data-dlg-prop="userLastName"]');
          const userMiddleNameEle = document.querySelector('[data-dlg-prop="userMiddleName"]');
          setTimeout(() => {
            // data-dlg-focus が指定されており、かつvalueが指定されていない要素のうち先頭のもにフォーカスがいく
            expect(document.activeElement).toBe(userLastNameEle);//
            done();
          }, 600);
        });

        const button1 = document.querySelector('[data-dlg="dlg-test-7-1"]');
        button1.click();


      }
    );//test

    // data-dlg-focus="always"が指定されている場合は、その要素のvalueが入力済でもそこにフォーカスがいく
    test('Always auto focus on the first input', async (done) => {


        document.body.innerHTML = INNER_HTML;
        const userNameData = {
          userFirstName: 'Tom',
          userLastName: '',
          userMiddleName: null,
        }
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);

        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-7-1',
          url: `${SERVER_ENDPOINT}/view/dlg-test-7-1-control-auto-focus-always.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            dialogModel.context = {};
            dialogMgr.bindModelToContext(
              userNameData, dialogModel.context);
          },
          onApply: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogMgr.bindModelFromContext(
              userNameData, data.dialog.context);
            dialogInstance.hide();
          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-7-1');
        const dialogElement = dialogModel.element;
        dialogElement.addEventListener('shown.bs.modal', (e) => {
          // ダイアログが表示された
          const userFirstNameEle = document.querySelector('[data-dlg-prop="userFirstName"]');
          const userLastNameEle = document.querySelector('[data-dlg-prop="userLastName"]');
          const userMiddleNameEle = document.querySelector('[data-dlg-prop="userMiddleName"]');
          setTimeout(() => {
            // data-dlg-focus="always"が指定されている場合は、その要素のvalueが入力済でもそこにフォーカスがいく
            expect(document.activeElement).toBe(userFirstNameEle);//
            done();
          }, 600);
        });

        const button1 = document.querySelector('[data-dlg="dlg-test-7-1"]');
        button1.click();


      }
    );//test

    //  dialogModel.focusPropertyはdata-dlg-focus属性より強い(フォーカスのキャンセル）
    test('Force disable focus by focusProperty', async (done) => {
        document.body.innerHTML = INNER_HTML;
        const userNameData = {
          userFirstName: null,
          userLastName: '',
          userMiddleName: null,
        }
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);

        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-7',
          url: `${SERVER_ENDPOINT}/view/dlg-test-7-control-auto-focus.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            dialogModel.context = {};
            dialogMgr.bindModelToContext(
              userNameData, dialogModel.context);
            dialogModel.focusProperty = 'none';
          },
          onApply: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogMgr.bindModelFromContext(
              userNameData, data.dialog.context);
            dialogInstance.hide();
          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-7');
        const dialogElement = dialogModel.element;
        dialogElement.addEventListener('shown.bs.modal', (e) => {
          // ダイアログが表示された
          const userFirstNameEle = document.querySelector('[data-dlg-prop="userFirstName"]');
          const userLastNameEle = document.querySelector('[data-dlg-prop="userLastName"]');
          const userMiddleNameEle = document.querySelector('[data-dlg-prop="userMiddleName"]');
          setTimeout(() => {
            // どこにもフォーカスがあたっていない
            expect(document.activeElement === userFirstNameEle).toBe(false);
            expect(document.activeElement === userLastNameEle).toBe(false);
            expect(document.activeElement === userMiddleNameEle).toBe(false);
            done();
          }, 600);
        });

        const button1 = document.querySelector('[data-dlg="dlg-test-7"]');
        button1.click();


      }
    );//test

    //  dialogModel.focusPropertyはdata-dlg-focus属性より強い（指定要素に強制フォーカス)
    test('Force set focus by focusProperty', async (done) => {
        document.body.innerHTML = INNER_HTML;
        const userNameData = {
          userFirstName: null,
          userLastName: '',
          userMiddleName: null,
        }
        const dialogMgr = createDlgMgr();
        await dialogMgr.setResourcesFromUrl(`${SERVER_ENDPOINT}/res/strings.json`);

        // Setup condition input dialog
        await dialogMgr.createDialog({
          id: 'dlg-test-7',
          url: `${SERVER_ENDPOINT}/view/dlg-test-7-control-auto-focus.html`,
          onCreate: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            dialogModel.context = {};
            dialogMgr.bindModelToContext(
              userNameData, dialogModel.context);
            dialogModel.focusProperty = 'userMiddleName';
          },
          onApply: (data) => {
            const dialogModel = data.dialog;
            const opener = dialogModel.opener;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogMgr.bindModelFromContext(
              userNameData, data.dialog.context);
            dialogInstance.hide();
          },
          onCancel: (data) => {
            const dialogModel = data.dialog;
            const dialogInstance = dialogModel.instance;//ダイアログのインスタンス
            dialogInstance.hide();
          },

        });//createDialog

        dialogMgr.activate();// ダイアログ関連のイベント登録
        BSN.initCallback();// Bootstrap4のDataAPIを有効化

        const dialogModel = dialogMgr.getDialogModelById('dlg-test-7');
        const dialogElement = dialogModel.element;
        dialogElement.addEventListener('shown.bs.modal', (e) => {
          // ダイアログが表示された
          const userFirstNameEle = document.querySelector('[data-dlg-prop="userFirstName"]');
          const userLastNameEle = document.querySelector('[data-dlg-prop="userLastName"]');
          const userMiddleNameEle = document.querySelector('[data-dlg-prop="userMiddleName"]');
          setTimeout(() => {
            // どこにもフォーカスがあたっていない
            expect(document.activeElement === userFirstNameEle).toBe(false);
            expect(document.activeElement === userLastNameEle).toBe(false);
            expect(document.activeElement === userMiddleNameEle).toBe(true);
            expect(document.activeElement).toBe(userMiddleNameEle);
            done();
          }, 600);
        });

        const button1 = document.querySelector('[data-dlg="dlg-test-7"]');
        button1.click();


      }
    );//test

  });// describe

});
