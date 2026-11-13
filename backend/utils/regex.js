// Escape user input before using it inside a MongoDB $regex query so a stray
// "(" or "*" can never turn into an invalid/expensive expression.
exports.escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
