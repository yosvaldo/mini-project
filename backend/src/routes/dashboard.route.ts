import { Router } from "express";
import {
  getDashboardMetrics,
  updateTransactionStatusAtomic,
} from "../controllers/dashboard.controller.js";
import {
  verifyToken,
  roleGuard,
} from "../middlewares/auth.middleware.js";

const dashboardRouter = Router();

dashboardRouter.use(
  verifyToken("access"),
  roleGuard("ORGANIZER")
);

dashboardRouter.get(
  "/metrics",
  getDashboardMetrics
);

dashboardRouter.patch(
  "/transactions/:transactionId",
  updateTransactionStatusAtomic
);

export default dashboardRouter;