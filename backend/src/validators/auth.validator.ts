import z from "zod/v4";

const commonSchema = {
	email: z
		.email("Invalid email format")
		.min(5, "Email must be at least 5 characters")
		.max(255, "Email must be at most 255 characters"),
	password: z
		.string()
		.regex(
			/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
			"Password must be at least 6 characters and contain at least one letter and one number",
		),
};

export const signUpSchema = z
	.object({
		...commonSchema,
		confirmPassword: z
			.string()
			.min(6, "Confirm password must be at least 6 characters"),
		role: z.string().refine((val) => val === "CUSTOMER" || val === "ORGANIZER", {
			message: "Role must be CUSTOMER or ORGANIZER",
		}),
		referredByCode: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
	});

export const signInSchema = z.object({
	...commonSchema,
});

export const googleSignInSchema = z.object({
	idToken: z.string().min(1, "Google ID token is required"),
	role: z.string().optional(),
});

export const PurchaseTicketSchema = z.object({
    eventId: z.uuid({ message: "Invalid event identifier format" }),
    quantity: z.number().int().positive({ message: "Quantity must be greater than zero" }),
    useCouponId: z.uuid({ message: "Invalid coupon identifier format" }).optional().nullable(),
    usePoints: z.boolean().optional().default(false)
});