const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    const issues = err.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return res.status(400).json({ error: `Validation failed: ${issues}` });
  }
  if (err.name === "CastError")
    return res.status(400).json({ error: "Invalid ID format" });
  if (err.code === 11000)
    return res.status(409).json({ error: "Duplicate entry." });

  res
    .status(err.statusCode || 500)
    .json({ error: err.message || "Internal server error" });
};

module.exports = errorHandler;
