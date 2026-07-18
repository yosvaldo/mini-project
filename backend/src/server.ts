import { app } from "./app.js";
import { APP_PORT } from "./configs/env.config.js";

app.listen(APP_PORT, () => {
    console.log(`Server is running on port ${APP_PORT}`);
});