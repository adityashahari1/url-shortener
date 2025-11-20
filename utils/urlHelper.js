function getBaseUrl(req) {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, ""); // Remove trailing slash
  }

  const protocol =
    req.get("x-forwarded-proto") ||
    req.protocol ||
    (req.secure ? "https" : "http");
  const host =
    req.get("x-forwarded-host") ||
    req.get("host") ||
    `${req.hostname || "localhost"}:${process.env.PORT || 8000}`;

  return `${protocol}://${host}`;
}

module.exports = {
  getBaseUrl,
};
