import type { Event } from "../generated/prisma/client.js";
import { TicketType } from "../generated/prisma/enums.js";

import { prisma } from "../libs/prisma.client.js";
import type { CreateEventData, UpdateEventData } from "../types/event.type.js";

class EventRepository {
    async findMany(): Promise<Event[]> {
        return prisma.event.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async find(where: { id: string }): Promise<Event | null> {
        return prisma.event.findUnique({
            where,
        });
    }

    async create(data: CreateEventData): Promise<Event> {
        return prisma.event.create({
            data: {
                organizerId: data.organizerId,

                name: data.name,
                location: data.location,

                date: data.date,

                price: data.price,

                seats: data.seats,

                imageUrl: data.imageUrl,

                type:
                    data.price > 0
                        ? TicketType.PAID
                        : TicketType.FREE,
            },
        });
    }

    async update(
        id: string,
        data: UpdateEventData,
    ): Promise<Event> {
        return prisma.event.update({
            where: { id },
            data: {
                ...data,

                ...(data.price !== undefined && {
                    type:
                        data.price > 0
                            ? TicketType.PAID
                            : TicketType.FREE,
                }),
            },
        });
    }
}

export default new EventRepository();