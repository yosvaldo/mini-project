import { Resend } from "resend";
import { RESEND_API_KEY } from "../configs/env.config.js";

const resend = new Resend(RESEND_API_KEY);

export default resend;