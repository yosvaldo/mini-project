import type { Request, Response, NextFunction } from "express";
import { prisma } from "../libs/prisma.client.js";

export async function getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const organizerId = req.user?.id || (req.user as any)?.userId;

    if (!organizerId) {
      res.status(401).json({ success: false, message: "Unauthorized: Missing organizer ID" });
      return;
    }

    const { search } = req.query;
    const searchTerm = typeof search === "string" ? search.trim() : "";

    const transactionWhere: any = {
      event: {
        organizerId: organizerId,
      },
    };

    if (searchTerm) {
      transactionWhere.OR = [
        {
          event: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            fullName: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [transactions, events] = await Promise.all([
      prisma.transaction.findMany({
        where: transactionWhere,
        include: {
          event: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.findMany({
        where: { organizerId },
        include: { _count: { select: { transactions: true } } },
      }),
    ]);

    const doneTransactions = transactions.filter((t: any) => t.status === "DONE");
    const totalRevenue = doneTransactions.reduce(
      (sum: number, t: any) => sum + Number(t.finalPrice ?? t.totalPrice ?? 0),
      0
    );
    const totalTicketsSold = doneTransactions.reduce(
      (sum: number, t: any) => sum + Number(t.quantity ?? 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        events,
        transactions,
        totalMetrics: {
          revenue: totalRevenue,
          ticketsSold: totalTicketsSold,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTransactionStatusAtomic(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    const result = await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { event: true },
      });

      if (!transaction) throw new Error("Transaction record missing");

      if (transaction.status !== "PENDING") {
        throw new Error("Transaction status already processed.");
      }

      const updatedTx = await tx.transaction.update({
        where: { id: transactionId },
        data: { status },
      });

      if (status === "DONE") {
        await tx.event.update({
          where: { id: transaction.eventId },
          data: {
            seats: {
              decrement: transaction.quantity,
            },
          },
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