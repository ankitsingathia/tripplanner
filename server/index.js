import { config } from "./config/index.js";
import { createApp } from "./app.js";

/**
 * Entry point. Builds the app and binds the port — nothing else lives here, so
 * everything above it stays importable and testable without starting a server.
 */
const app = await createApp();

app.listen(config.port, () => {
  console.log(`Wanderly running at http://localhost:${config.port}`);
});
