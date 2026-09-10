import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Production mode serves the built bundle instead of booting Vite, which keeps
// this test to the API alone. It has to be set before the config module loads.
process.env.NODE_ENV = "production";
const { createApp } = await import("../../server/app.js");

let server;
let baseUrl;

beforeAll(async () => {
  const app = await createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

// None of these requests reach Gemini, Nominatim or Overpass — each one is
// answered by validation that runs first — so the suite needs no network.
describe("API", () => {
  it("reports configuration on /api/health without exposing the key", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(typeof body.geminiConfigured).toBe("boolean");
    expect(Object.keys(body)).not.toContain("apiKey");
  });

  it("skips the geocoder for search input shorter than two characters", async () => {
    const response = await fetch(`${baseUrl}/api/search?input=a`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ suggestions: [] });
  });

  it("rejects a nearby lookup without coordinates", async () => {
    const response = await fetch(`${baseUrl}/api/nearby?lat=abc`);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "lat and lon are required." });
  });

  it("validates a trip request before doing any work", async () => {
    const response = await fetch(`${baseUrl}/api/generate-trip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination: "Jaipur" })
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Destination, duration, and budget are required." });
  });

  it("keeps unknown API routes as 404s instead of serving the app shell", async () => {
    const response = await fetch(`${baseUrl}/api/does-not-exist`);

    expect(response.status).toBe(404);
  });
});
