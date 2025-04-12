export const roundToTwoDecimals = (num) => {
  return Math.round(num * 100) / 100;
};

export const isProfitMarginAboveThreshold = (profitMargin, setMargin) => {
  return profitMargin >= setMargin;
};

export const calculateProfitMargin = (retail, wholesale) => {
  return roundToTwoDecimals(((retail - wholesale) / retail) * 100);
};
