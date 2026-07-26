import { z } from "zod";

export const createEventSchema = z.object({
    name: z
        .string()
        .min(3, "Event name must be at least 3 characters.")
        .max(100, "Event name is too long."),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters.")
        .max(1000, "Description is too long."),

    location: z.enum([
        "Jakarta",
        "Bandung",
        "Surabaya",
        "Bali",
        "Yogyakarta",
    ]),

    date: z.coerce.date(),

    price: z
        .number()
        .min(0, "Price cannot be negative."),

    seats: z
        .number()
        .int()
        .positive("Seats must be greater than zero."),

    imageUrl: z
        .url("Invalid image URL.")
        .optional(),
});

export const updateEventSchema = createEventSchema.partial();