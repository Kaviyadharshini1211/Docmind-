// server/metrics.js — Prometheus metrics for DocMind backend
const client = require("prom-client");

// ── 1. Collect default Node.js metrics (CPU, memory, event loop, GC, etc.)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: "docmind_" });

// ── 2. Custom HTTP counters
const httpRequestsTotal = new client.Counter({
  name: "docmind_http_requests_total",
  help: "Total number of HTTP requests received",
  labelNames: ["method", "route", "status_code"],
});

// ── 3. HTTP request duration histogram
const httpRequestDurationSeconds = new client.Histogram({
  name: "docmind_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// ── 4. Active connections gauge
const activeConnections = new client.Gauge({
  name: "docmind_active_connections",
  help: "Number of currently active HTTP connections",
});

// ── 5. Express middleware — attaches to every request
const metricsMiddleware = (req, res, next) => {
  // Skip tracking the /metrics endpoint itself
  if (req.path === "/metrics") return next();

  const end = httpRequestDurationSeconds.startTimer();
  activeConnections.inc();

  res.on("finish", () => {
    const route = req.route ? req.route.path : req.path || "unknown";
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
    };
    httpRequestsTotal.inc(labels);
    end(labels);
    activeConnections.dec();
  });

  next();
};

// ── 6. Helpers for the /metrics route
const getMetrics = async () => await client.register.metrics();
const getContentType = () => client.register.contentType;

module.exports = { metricsMiddleware, getMetrics, getContentType };
