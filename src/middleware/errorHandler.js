function notFound(req, res, _next) {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API endpoint not found." });
  }
  return res.status(404).sendFile(require("path").join(__dirname, "..", "..", "public", "404.html"));
}

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error("Server error:", err.message);
  }
  if (req.path.startsWith("/api/") || req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.status(status).json({
      message: status >= 500 ? "Something went wrong. Please try again." : err.message,
      details: err.details || undefined
    });
  }
  return res.status(status).send("Something went wrong.");
}

module.exports = { notFound, errorHandler };
