/**
 * Formats a number as Vietnamese Dong (VND) — e.g. 20000 → "20.000"
 * Uses the vi-VN locale so periods are thousand-separators and there
 * are no trailing decimal places (VND has no sub-unit).
 *
 * @param {number|null|undefined} amount
 * @returns {string}
 */
export const formatVND = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "0";
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount));
};
