import { Router } from "express";

import { health } from "../controllers/health.controller.js";
import { generateTrip } from "../controllers/trip.controller.js";
import { search, nearby } from "../controllers/places.controller.js";
import { placeImage } from "../controllers/image.controller.js";

/**
 * Every HTTP route in one readable table. Mounted at /api by the app, so paths
 * here are relative — adding an endpoint means one line here plus a controller.
 */
const router = Router();

router.get("/health", health);
router.post("/generate-trip", generateTrip);
router.get("/search", search);
router.get("/nearby", nearby);
router.get("/place-image", placeImage);

export default router;
