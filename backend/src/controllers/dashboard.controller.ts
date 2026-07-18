import type { Request, Response, NextFunction } from "express";
import { prisma } from "../libs/prisma.client.js";

export async function getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const organizerId = req.user?.id;

    const transactions = await (prisma as any).transaction.findMany({
      where: { event: { organizerId } },
      include: { event: true, user: true },
      orderBy: { createdAt: "asc" }
    });

    const events = await (prisma as any).event.findMany({
      where: { organizerId },
      include: { _count: { select: { transactions: true } } }
    });

    res.status(200).json({
      success: true,
      data: { events, transactions }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTransactionStatusAtomic(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    const result = await (prisma as any).$transaction(async (tx: any) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { event: true }
      });

      if (!transaction) throw new Error("Transaction record missing");
      
      if (transaction.status !== "PENDING") {
        throw new Error("Transaction status already processed.");
      }

      const updatedTx = await tx.transaction.update({
        where: { id: transactionId },
        data: { status }
      });

      if (status === "DONE") {
        await tx.event.update({
          where: { id: transaction.eventId },
          data: {
            seats: {
              decrement: transaction.quantity
            }
          }
        });
      }

      return updatedTx;
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err: unknown) {
    const errorObject = err as Error;
    return res.status(400).json({ success: false, message: errorObject.message });
  }
}