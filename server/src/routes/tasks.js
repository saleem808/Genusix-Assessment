import express from "express";
import { buildSummary, listAuditTrail, listTasks, updateTask } from "../services/tasks.service.js";

const router = express.Router();

router.get("/stats/summary", (_req, res) => {
  res.json(buildSummary());
});

router.get("/audit", (req, res) => {
  const limit = Number(req.query.limit || 20);
  res.json({ items: listAuditTrail(limit) });
});

router.get("/", (req, res, next) => {
  try {
    res.json(listTasks(req.query));
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", (req, res, next) => {
  try {
    const actor = req.header("x-actor") || "dashboard-user";
    res.json(updateTask(req.params.id, req.body, actor));
  } catch (error) {
    next(error);
  }
});

export default router;
