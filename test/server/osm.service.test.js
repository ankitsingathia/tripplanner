import { afterEach, describe, expect, it, vi } from "vitest";

import { findNearby, toSuggestion } from "../../server/services/osm.service.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toSuggestion", () => {
  it("shapes a Nominatim result into an autocomplete suggestion", () => {
    const suggestion = toSuggestion({
      place_id: 123,
      display_name: "Jaipur, Rajasthan, India",
      lat: "26.91",
      lon: "75.78",
      type: "city",
      category: "place",
      address: { city: "Jaipur", state: "Rajasthan", country: "India" }
    });

    expect(suggestion).toEqual({
      placeId: "123",
      label: "Jaipur, Rajasthan, India",
      mainText: "Jaipur",
      secondaryText: "Rajasthan, India",
      lat: 26.91,
      lon: 75.78,
      type: "city",
      category: "place"
    });
  });

  it("falls back to the first part of the display name", () => {
    const suggestion = toSuggestion({ place_id: 1, display_name: "Somewhere, Far Away", lat: "0", lon: "0" });

    expect(suggestion.mainText).toBe("Somewhere");
    expect(suggestion.secondaryText).toBe("");
  });
});

describe("findNearby", () => {
  it("shares one Overpass call between repeat requests for the same spot", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        elements: [{ type: "node", id: 1, lat: 1, lon: 2, tags: { name: "Chai Point", amenity: "cafe" } }]
      })
    }));
    vi.stubGlobal("fetch", fetchMock);

    // Within ~110 m of each other, so they share a cache key.
    const [preview, submit] = await Promise.all([findNearby(10.0001, 20.0001), findNearby(10.0002, 20.0002)]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(submit).toBe(preview);
    expect(preview[0]).toMatchObject({ name: "Chai Point", category: "cafe", lat: 1, lon: 2 });
  });

  it("remembers a failure, so a submit after a failed preview doesn't wait all over again", async () => {
    const fetchMock = vi.fn(async () => ({ ok: false }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(findNearby(30, 40)).rejects.toThrow("Overpass nearby lookup failed");
    await expect(findNearby(30, 40)).rejects.toThrow("Overpass nearby lookup failed");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("drops places without a name or coordinates", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        elements: [
          { type: "node", id: 1, lat: 1, lon: 1, tags: { tourism: "attraction" } },
          { type: "way", id: 2, center: { lat: 5, lon: 6 }, tags: { name: "City Palace", tourism: "attraction" } }
        ]
      })
    })));

    const places = await findNearby(50, 60);

    expect(places).toEqual([
      { id: "way-2", name: "City Palace", category: "attraction", area: "", lat: 5, lon: 6 }
    ]);
  });
});
