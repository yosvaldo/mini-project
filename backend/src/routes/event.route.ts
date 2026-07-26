import { Router } from "express";

import eventController from "../controllers/event.controller.js";
import { roleGuard, verifyToken } from "../middlewares/auth.middleware.js";

const eventRoute = Router();

eventRoute.get("/", eventController.getAll);

eventRoute.get("/:id", eventController.getById);

eventRoute.post(
    "/",
    verifyToken("access"),
    roleGuard("ORGANIZER"),
    eventController.create,
);

eventRoute.patch(
    "/:id",
    verifyToken("access"),
    roleGuard("ORGANIZER"),
    eventController.update,
);

export default eventRoute;