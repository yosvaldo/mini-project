import Handlebars from "handlebars";
import fs from "fs";
import { join } from "path";

const BASE_TEMPLATE_PATH = join(process.cwd(), "/src/templates");

function renderTemplate(templateName: string, context: Record<string, any>) {
	const fullPath = join(BASE_TEMPLATE_PATH, templateName);

	if (!fs.existsSync(fullPath)) {
		throw new Error(`Template not found at: ${fullPath}`);
	}

	const templateSource = fs.readFileSync(fullPath, "utf-8");
	const compiled = Handlebars.compile(templateSource);
	return compiled(context);
}

export default renderTemplate;