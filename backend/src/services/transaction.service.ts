import { prisma } from "../libs/prisma.client.js";
import AppError from "../errors/app.error.js";
import renderTemplate from "../libs/handlebars.js";
import EmailService from "./email.service.js";

interface PointUsage {
  id: string;
  amountToDeduct: number;
  fullAmount: number;
}

interface CouponRecord {
  id: string;
  discountPct: number;
}

class TransactionService {
  async calculateCheckoutPreview(
    userId: string,
    eventId: string,
    quantity: number,
    useCouponId?: string | null,
    usePoints: boolean = false
  ) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Target event not found", 404);
    if (event.seats < quantity) throw new AppError("Insufficient seats remaining", 400);

    const basePrice = event.price * quantity;
    let totalDiscount = 0;
    let couponToUse: CouponRecord | null = null;
    let pointsToUse: PointUsage[] = [];

    if (basePrice === 0) {
      return {
        basePrice: 0,
        discount: 0,
        finalPrice: 0,
        pointsToUse: [],
        couponToUse: null,
      };
    }

    if (useCouponId) {
      const foundCoupon = await prisma.coupon.findFirst({
        where: { id: useCouponId, userId, isUsed: false, expiresAt: { gt: new Date() } }
      });
      if (!foundCoupon) throw new AppError("Coupon is invalid or expired", 400);

      couponToUse = { id: foundCoupon.id, discountPct: foundCoupon.discountPct };
      totalDiscount += Math.floor((basePrice * foundCoupon.discountPct) / 100);
    }

    let runningPrice = basePrice - totalDiscount;
    if (runningPrice < 0) runningPrice = 0;

    if (usePoints && runningPrice > 0) {
      const availablePoints = await prisma.point.findMany({
        where: { userId, isUsed: false, expiresAt: { gt: new Date() } },
        orderBy: { expiresAt: "asc" }
      });

      let remainingCostToCover = runningPrice;

      for (const pt of availablePoints) {
        if (remainingCostToCover <= 0) break;

        const deduct = Math.min(pt.amount, remainingCostToCover);
        pointsToUse.push({
          id: pt.id,
          amountToDeduct: deduct,
          fullAmount: pt.amount,
        });

        remainingCostToCover -= deduct;
        totalDiscount += deduct;
        runningPrice -= deduct;
      }
    }

    return {
      basePrice,
      discount: totalDiscount,
      finalPrice: Math.max(0, runningPrice),
      pointsToUse,
      couponToUse
    };
  }

  async processTicketPurchase(
    userId: string,
    payload: { eventId: string; quantity: number; useCouponId?: string | null; usePoints: boolean },
    paymentProofUrl: string
  ) {
    const transaction = await prisma.$transaction(async (tx) => {
      const preview = await this.calculateCheckoutPreview(
        userId,
        payload.eventId,
        payload.quantity,
        payload.useCouponId,
        payload.usePoints
      );

      const event = await tx.event.findUnique({ where: { id: payload.eventId } });
      if (!event || event.seats < payload.quantity) {
        throw new AppError("Seats sold out during processing", 400);
      }

      await tx.event.update({
        where: { id: payload.eventId },
        data: { seats: { decrement: payload.quantity } }
      });

      const newTransaction = await tx.transaction.create({
        data: {
          userId,
          eventId: payload.eventId,
          quantity: payload.quantity,
          basePrice: preview.basePrice,
          discount: preview.discount,
          finalPrice: preview.finalPrice,
          paymentProof: paymentProofUrl,
          status: "PENDING"
        },
        include: {
          user: true,
          event: true
        }
      });

      if (preview.couponToUse) {
        await tx.coupon.update({
          where: { id: preview.couponToUse.id },
          data: { isUsed: true, transactionId: newTransaction.id }
        });
      }

      if (payload.usePoints && preview.pointsToUse.length > 0) {
        for (const pt of preview.pointsToUse) {
          if (pt.amountToDeduct >= pt.fullAmount) {
            await tx.point.update({
              where: { id: pt.id },
              data: { isUsed: true, transactionId: newTransaction.id }
            });
          } else {
            await tx.point.update({
              where: { id: pt.id },
              data: { amount: { decrement: pt.amountToDeduct } }
            });
          }
        }
      }

      return newTransaction;
    });

    if (transaction?.user?.email) {
      try {
        const emailHtml = renderTemplate("payment-proof.email.hbs", {
          transactionId: transaction.id,
          finalPrice: transaction.finalPrice.toLocaleString()
        });

        EmailService.sendEmail(
          transaction.user.email,
          `Payment Proof Received - Transaction #${transaction.id}`,
          emailHtml
        ).catch((err) => {
          console.error("Failed to send payment proof email in background:", err);
        });
      } catch (err) {
        console.error("Failed to render payment proof email template:", err);
      }
    }

    return transaction;
  }

  async reuploadPaymentProof(userId: string, transactionId: string, newPaymentProofUrl: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId }
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (transaction.status !== "REJECTED") {
      throw new AppError("Payment proof can only be reuploaded for rejected transactions", 400);
    }

    return await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProof: newPaymentProofUrl,
        status: "PENDING"
      }
    });
  }

  async updateTransactionStatus(organizerId: string, transactionId: string, status: "DONE" | "REJECTED") {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        event: true,
        user: true
      }
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    const eventOrganizerId = (transaction.event as any).organizerId ?? (transaction.event as any).userId;
    if (eventOrganizerId && eventOrganizerId !== organizerId) {
      throw new AppError("Unauthorized to update this transaction", 403);
    }

    if (transaction.status === status) {
      return transaction;
    }

    const updatedTransaction = await prisma.$transaction(async (tx) => {
      if (status === "REJECTED" && transaction.status !== "REJECTED") {
        await tx.event.update({
          where: { id: transaction.eventId },
          data: { seats: { increment: transaction.quantity } }
        });

        await tx.coupon.updateMany({
          where: { transactionId: transaction.id },
          data: { isUsed: false, transactionId: null }
        });

        await tx.point.updateMany({
          where: { transactionId: transaction.id },
          data: { isUsed: false, transactionId: null }
        });
      }

      if (status === "DONE" && transaction.status === "REJECTED") {
        await tx.event.update({
          where: { id: transaction.eventId },
          data: { seats: { decrement: transaction.quantity } }
        });
      }

      return await tx.transaction.update({
        where: { id: transactionId },
        data: { status },
        include: {
          user: true,
          event: true
        }
      });
    });

    if (status === "DONE" && updatedTransaction?.user?.email) {
      try {
        const emailHtml = renderTemplate("ticket-approved.email.hbs", {
          fullName: updatedTransaction.user.fullName || updatedTransaction.user.email.split("@")[0],
          eventName: updatedTransaction.event.name,
          quantity: updatedTransaction.quantity,
          finalPrice: updatedTransaction.finalPrice.toLocaleString(),
          transactionId: updatedTransaction.id
        });

        EmailService.sendEmail(
          updatedTransaction.user.email,
          `🎟️ Pass Approved & Confirmed - ${updatedTransaction.event.name}`,
          emailHtml
        ).catch((err) => {
          console.error("Failed to send ticket approval email in background:", err);
        });
      } catch (err) {
        console.error("Failed to render ticket approval email template:", err);
      }
    }

    return updatedTransaction;
  }
}

export default new TransactionService();