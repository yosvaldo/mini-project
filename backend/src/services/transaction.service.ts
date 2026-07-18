import { prisma } from "../libs/prisma.client.js";
import AppError from "../errors/app.error.js";

interface PointRecord {
    id: string;
    amount: number;
    expiresAt: Date;
    isUsed: boolean;
}

interface CouponRecord {
    id: string;
    discountPct: number;
}

class TransactionService {
    async calculateCheckoutPreview(userId: string, eventId: string, quantity: number, useCouponId?: string | null, usePoints: boolean = false) {
        const event = await (prisma as any).event.findUnique({ where: { id: eventId } });
        if (!event) throw new AppError("Target event not found", 404);
        if (event.seats < quantity) throw new AppError("Insufficient seats remaining", 400);

        const basePrice = event.price * quantity;
        let totalDiscount = 0;
        let couponToUse: CouponRecord | null = null;
        let pointsToUse: PointRecord[] = [];

        if (useCouponId) {
            const foundCoupon = await (prisma as any).coupon.findFirst({
                where: { id: useCouponId, userId, isUsed: false, expiresAt: { gt: new Date() } }
            });
            if (!foundCoupon) throw new AppError("Coupon is invalid or expired", 400);
            
            couponToUse = { id: foundCoupon.id, discountPct: foundCoupon.discountPct };
            totalDiscount += Math.floor(basePrice * 0.10); 
        }

        let runningPrice = basePrice - totalDiscount;
        if (runningPrice < 0) runningPrice = 0;

        if (usePoints && runningPrice > 0) {
            const availablePoints = await (prisma as any).point.findMany({
                where: { userId, isUsed: false, expiresAt: { gt: new Date() } },
                orderBy: { expiresAt: "asc" }
            });

            const pointBalance = availablePoints.reduce((sum: number, p: PointRecord) => sum + p.amount, 0);
            
            if (pointBalance > 0) {
                if (pointBalance >= runningPrice) {
                    totalDiscount += runningPrice;
                    runningPrice = 0;
                } else {
                    totalDiscount += pointBalance;
                    runningPrice -= pointBalance;
                }
                pointsToUse = availablePoints;
            }
        }

        return {
            basePrice,
            discount: totalDiscount,
            finalPrice: runningPrice,
            pointsToUse,
            couponToUse
        };
    }

    async processTicketPurchase(userId: string, payload: { eventId: string; quantity: number; useCouponId?: string | null; usePoints: boolean }, paymentProofUrl: string) {
        return await (prisma as any).$transaction(async (tx: any) => {
            const preview = await this.calculateCheckoutPreview(userId, payload.eventId, payload.quantity, payload.useCouponId, payload.usePoints);

            const event = await tx.event.findUnique({ where: { id: payload.eventId } });
            if (!event || event.seats < payload.quantity) {
                throw new AppError("Seats sold out during processing", 400);
            }

            await tx.event.update({
                where: { id: payload.eventId },
                data: { seats: { decrement: payload.quantity } }
            });

            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    eventId: payload.eventId,
                    quantity: payload.quantity,
                    basePrice: preview.basePrice,
                    discount: preview.discount,
                    finalPrice: preview.finalPrice,
                    paymentProof: paymentProofUrl
                }
            });

            if (preview.couponToUse) {
                await tx.coupon.update({
                    where: { id: preview.couponToUse.id },
                    data: { isUsed: true, transactionId: transaction.id }
                });
            }

            if (payload.usePoints && preview.pointsToUse.length > 0) {
                let costCovered = preview.basePrice - (preview.couponToUse ? Math.floor(preview.basePrice * 0.1) : 0);
                
                for (const pointRecord of preview.pointsToUse) {
                    if (costCovered <= 0) break;
                    
                    await tx.point.update({
                        where: { id: pointRecord.id },
                        data: { isUsed: true, transactionId: transaction.id }
                    });
                    costCovered -= pointRecord.amount;
                }
            }

            return transaction;
        });
    }
}

export default new TransactionService();