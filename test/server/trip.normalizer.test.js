import { describe, expect, it } from "vitest";

import { normalizeTrip } from "../../server/domain/trip.normalizer.js";

const request = {
  destination: "Jaipur",
  durationDays: 2,
  budget: "Moderate",
  travelers: "2 people",
  pace: "Balanced",
  interests: ["Local food"]
};

describe("normalizeTrip", () => {
  it("produces a complete trip even when the model returns nothing usable", () => {
    const trip = normalizeTrip({}, request);

    expect(trip.title).toBe("Jaipur 2-Day Escape");
    expect(trip.destination).toBe("Jaipur");
    expect(trip.durationDays).toBe(2);
    expect(trip.days).toEqual([]);
    expect(trip.budgetBreakdown).toEqual([]);
    expect(trip.routeStrategy).toBeTruthy();
    expect(trip.heroImage).toMatch(/^https:\/\/images\.unsplash\.com\//);
    expect(trip.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("defaults missing day and stop fields and numbers stops in order", () => {
    const trip = normalizeTrip({ days: [{ stops: [{ name: "Amber Fort" }, {}] }] }, request);
    const [day] = trip.days;

    expect(day).toMatchObject({ day: 1, theme: "Day 1", area: "Jaipur" });
    expect(day.stops.map((stop) => stop.order)).toEqual([1, 2]);
    expect(day.stops[0].name).toBe("Amber Fort");
    expect(day.stops[1].name).toBe("Stop 2");
    expect(day.stops[0].type).toBe("Sightseeing");
  });

  it("keeps the coordinates the model returned and nulls the ones it didn't", () => {
    const trip = normalizeTrip(
      { days: [{ stops: [{ name: "Hawa Mahal", latitude: "26.9239", longitude: "75.8267" }, { name: "Unknown" }] }] },
      request
    );
    const [withCoords, withoutCoords] = trip.days[0].stops;

    expect(withCoords).toMatchObject({ latitude: 26.9239, longitude: 75.8267 });
    expect(withoutCoords).toMatchObject({ latitude: null, longitude: null });
  });

  it("prefers the model's map centre and falls back to the geocoded destination", () => {
    const coords = { lat: 26.91, lon: 75.78 };

    expect(normalizeTrip({ center: { lat: 1, lon: 2 } }, { ...request, destinationCoords: coords }).center)
      .toEqual({ lat: 1, lon: 2 });
    expect(normalizeTrip({}, { ...request, destinationCoords: coords }).center).toEqual(coords);
    expect(normalizeTrip({}, request).center).toBeNull();
  });

  it("falls back to the number of days generated when the duration isn't a number", () => {
    const trip = normalizeTrip({ days: [{}, {}, {}] }, { ...request, durationDays: "a few" });

    expect(trip.durationDays).toBe(3);
  });
});
