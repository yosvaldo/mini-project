import nodemailer from "nodemailer";
import {
    SMTP_HOST,
    SMTP_PASS,
    SMTP_PORT,
    SMTP_USER,
} from "../configs/env.config.js";

const port = Number(SMTP_PORT) || 465;

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: port,
    secure: port === 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    connectionTimeout: 10000, 
    greetingTimeout: 5000,   
});

export default transporter;