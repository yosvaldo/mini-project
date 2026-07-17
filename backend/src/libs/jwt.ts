import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
	throw new Error(
		"JWT_ACCESS_SECRET or JWT_REFRESH_SECRET is not set in environment variables.",
	);
}

export default jwt;

export { ACCESS_SECRET, ACCESS_EXPIRES_IN, REFRESH_SECRET, REFRESH_EXPIRES_IN };