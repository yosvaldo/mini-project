import "dotenv/config";

const APP_NAME = process.env.APP_NAME || "API";
const APP_PORT = process.env.APP_PORT || 8000;
const APP_ENV = process.env.APP_ENV || "development";

const IS_PROD = APP_ENV === "production";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const DB_URL = process.env.DATABASE_URL || "";
const DIRECT_DB_URL = process.env.DIRECT_URL || "";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_123";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_123";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

export {
	APP_NAME,
	APP_PORT,
	APP_ENV,
	DB_URL,
	DIRECT_DB_URL,
	IS_PROD,
	CLIENT_ORIGIN,
	JWT_ACCESS_SECRET,
	JWT_REFRESH_SECRET,
	JWT_ACCESS_EXPIRES_IN,
	JWT_REFRESH_EXPIRES_IN,
	RESEND_API_KEY,
};