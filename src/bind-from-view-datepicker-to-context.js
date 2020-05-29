/**
 * View上のDatePickerが保持している日付値を、Contextに戻す
 * @param dlgInputEle
 * @returns {Date}
 * @author Tom Misawa <riversun.org@gmail.com> (https://github.com/riversun)
 */
export default function doPopulateDatePickerToContext(dlgInputEle) {
  // eslint-disable-next-line no-underscore-dangle
  const fp = dlgInputEle._flatpickr;
  return fp.selectedDates[0];
}
