import flatpickr from 'flatpickr';
import { Japanese } from 'flatpickr/dist/l10n/ja';

/**
 * Contextに格納された Date値をView(flatpickrによるdatetime picker対応input要素)に表示する
 * @param dialogModel
 * @param opt
 * @author Tom Misawa <riversun.org@gmail.com> (https://github.com/riversun)
 */
export default function doPopulateContextToDatePicker(dialogModel, opt) {
  const dialogEle = dialogModel.element;
  const { context } = dialogModel;
  const { locale } = opt;

  // 日付ピッカー
  const dateInputEles = dialogEle.querySelectorAll('[data-dlg-input-type=date]');
  for (const dateInputEle of dateInputEles) {
    // flatpickr オプションはこちら
    // https://flatpickr.js.org/options/
    //
    const propName = dateInputEle.getAttribute('data-dlg-prop');

    // contextに格納されているdateオブジェクト
    const date = context[propName];
    const fpOpt = {};
    if (locale === 'ja') {
      fpOpt.locale = Japanese;
      fpOpt.dateFormat = 'Y年m月d日(D)';
    }
    if (date) {
      fpOpt.defaultDate = date;
    }
    // fpOpt.disableMobile='true';//モバイルモードのときにスマホnativeなpickerをだしたい場合はコメントアウト

    flatpickr(dateInputEle, fpOpt);
  }

  // 時間ピッカー
  // 時間は入力したひのDateで保存される。時間部分だけつかえばよい
  const timeInputEles = dialogEle.querySelectorAll('[data-dlg-input-type=time]');
  for (const timeInputEle of timeInputEles) {
    const propName = timeInputEle.getAttribute('data-dlg-prop');
    const date = context[propName];
    const fpOpt = {
      enableTime: true, // 時間の選択可否
      noCalendar: true, // カレンダー非表示
      dateFormat: 'H:i',
      minuteIncrement: 1, // 分を1分ごとに上下させる
    };
    if (locale === 'ja') {
      fpOpt.locale = Japanese;
      fpOpt.dateFormat = 'H時i分';
    }
    if (date) {
      fpOpt.defaultDate = date;
    }
    flatpickr(timeInputEle, fpOpt);
  }

  // 日付＆時間ピッカー
  const dateTimeInputEles = dialogEle.querySelectorAll('[data-dlg-input-type=datetime]');
  for (const dateTimeInputEle of dateTimeInputEles) {
    const propName = dateTimeInputEle.getAttribute('data-dlg-prop');
    const date = context[propName];
    const fpOpt = {
      enableTime: true, // 時間の選択可否
      noCalendar: false, // カレンダー非表示
      dateFormat: 'm-d-Y H:i',
      minuteIncrement: 1, // 分を1分ごとに上下させる
    };
    if (locale === 'ja') {
      fpOpt.locale = Japanese;
      fpOpt.dateFormat = 'Y年m月d日(D) H時i分';
    }
    if (date) {
      fpOpt.defaultDate = date;
    }
    flatpickr(dateTimeInputEle, fpOpt);
  }
}
