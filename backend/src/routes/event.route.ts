import { Router } from "express";
import { prisma } from "../libs/prisma.client.js";

const eventRoute = Router();

eventRoute.get("/", async (_, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ message: "Failed to fetch events from Neon DB" });
  }
});

export default eventRoute;