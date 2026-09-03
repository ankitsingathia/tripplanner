import { createTrip } from "../services/trip.service.js";

export async function generateTrip(req, res, next) {
  try {
    const trip = await createTrip(req.body);
    res.json({ trip });
  } catch (error) {
    next(error);
  }
}
