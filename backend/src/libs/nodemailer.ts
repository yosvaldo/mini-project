import nodemailer, { type TransportOptions } from "nodemailer";
import {
	IS_PROD,
	SMTP_HOST,
	SMTP_PASS,
	SMTP_PORT,
	SMTP_USER,
} from "../configs/env.config.js";

const testAccount = await nodemailer.createTestAccount();

if (!testAccount) {
	throw new Error(
		"Failed to create a testing account. Please check your connection and try again.",
	);
}

if (!IS_PROD) {
	console.log("Ethereal test account:");
	console.log("User:", testAccount.user);
	console.log("Pass:", testAccount.pass);
	console.log("Login at: https://ethereal.email/login");
}

const transporter = nodemailer.createTransport(
	IS_PROD
		? ({
				host: SMTP_HOST,
				port: SMTP_PORT,
				auth: {
					user: SMTP_USER,
					pass: SMTP_PASS,
				},
			} as TransportOptions)
		: {
				host: testAccount.smtp.host,
				port: testAccount.smtp.port,
				auth: {
					user: testAccount.user,
					pass: testAccount.pass,
				},
			},
);

export default transporter;