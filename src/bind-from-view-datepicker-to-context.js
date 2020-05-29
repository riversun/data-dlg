/**
 * View上のDatePickerが保持している日付値を、Contextに戻す
 * @param dlgInputEle
 * @returns {Date}
 */
export default function doPopulateDatePickerToContext(dlgInputEle) {
  // eslint-disable-next-line no-underscore-dangle
  const fp = dlgInputEle._flatpickr;
  return fp.selectedDates[0];
}
