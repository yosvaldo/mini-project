import nodemailer, { type TransportOptions } from "nodemailer";
import {
    SMTP_HOST,
    SMTP_PASS,
    SMTP_PORT,
    SMTP_USER,
} from "../configs/env.config.js";

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
} as TransportOptions);

export default transporter;