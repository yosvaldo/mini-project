import type { CorsOptions } from "cors";
import { CLIENT_ORIGIN } from "./env.config.js";

const corsOptions: CorsOptions = {
	origin: CLIENT_ORIGIN,
	credentials: true,
};

export default corsOptions;