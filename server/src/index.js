import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import winston from 'winston';
// Kept express-winston here because winston-middleware targets Winston 2.x and
// crashes with our Winston 3.x format API (combine/colorize/json).
import expressWinston from 'express-winston';
import tasksRouter from "./routes/tasks.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { attachRequestContext } from "./utils/requestContext.js";
const app = express();
const PORT = 4000;
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(attachRequestContext);
app.use(
  morgan(":method :url :status :response-time ms req=:req[x-request-id]")
);
app.use(expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
}));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "ops-dashboard-api",
    version: "1.1.0",
    features: [
      "advanced filtering",
      "validated updates",
      "sorting",
      "audit trail",
      "summary metrics"
    ]
  });
});

app.use("/tasks", tasksRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
