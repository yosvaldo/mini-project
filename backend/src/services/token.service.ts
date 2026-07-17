import type { SignOptions } from "jsonwebtoken";
import jwt from "../libs/jwt.js";

class TokenService {
	static generate(payload: object, secret: string, expiresIn: string): string {
		return jwt.sign(payload, secret, { expiresIn } as SignOptions);
	}

	static verify(token: string, secret: string): object | null {
		return jwt.verify(token, secret) as object | null;
	}
}

export default TokenService;