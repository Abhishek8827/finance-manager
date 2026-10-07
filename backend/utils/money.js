exports.rupeesToPaise = (amount) => {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!isFinite(n) || n < 0) throw new Error("Invalid amount");
  return Math.round(n * 100);
};

exports.paiseToRupees = (paise) => {
  return Math.round(paise) / 100;
};
