import Handlebars from "handlebars";
import fs from "fs";
import { join } from "path";

function renderTemplate(templateName: string, context: Record<string, any>) {
    const possiblePaths = [
        join(process.cwd(), "src", "templates", templateName),
        join(process.cwd(), "dist", "templates", templateName),
        join(process.cwd(), "templates", templateName),
    ];

    const fullPath = possiblePaths.find((p) => fs.existsSync(p));

    if (!fullPath) {
        throw new Error(
            `Template "${templateName}" not found in paths: ${possiblePaths.join(", ")}`
        );
    }

    const templateSource = fs.readFileSync(fullPath, "utf-8");
    const compiled = Handlebars.compile(templateSource);
    return compiled(context);
}

export default renderTemplate;