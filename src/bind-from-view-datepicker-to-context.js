/**
 * View上のDatePickerが保持している日付値を、Contextに戻す
 * @param dlgInputEle
 * @returns {Date}
 */
export function doPopulateDatePickerToContext(dlgInputEle) {
  const fp = dlgInputEle._flatpickr;
  return fp.selectedDates[0];
}
