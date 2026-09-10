import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "../../server/config/index.js";
import { generateTrip, thinkingConfigFor } from "../../server/services/gemini.service.js";

const request = { destination: "Jaipur", durationDays: 1, budget: "Low" };

function modelReplies(text) {
  const fetchMock = vi.fn(async () => ({
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] })
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  config.gemini.apiKey = "test-key";
  config.gemini.model = "gemini-2.5-flash";
  config.gemini.thinkingBudget = 0;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("thinkingConfigFor", () => {
  it("turns thinking off for 2.5 Flash models", () => {
    expect(thinkingConfigFor("gemini-2.5-flash", 0)).toEqual({ thinkingConfig: { thinkingBudget: 0 } });
    expect(thinkingConfigFor("gemini-2.5-flash-lite", 0)).toEqual({ thinkingConfig: { thinkingBudget: 0 } });
  });

  it("leaves other model families on the API default", () => {
    expect(thinkingConfigFor("gemini-2.5-pro", 0)).toEqual({});
    expect(thinkingConfigFor("gemini-3-flash", 0)).toEqual({});
  });

  it("sends nothing for a budget that isn't a number", () => {
    expect(thinkingConfigFor("gemini-2.5-flash", Number.NaN)).toEqual({});
  });
});

describe("generateTrip", () => {
  it("refuses to run without an API key", async () => {
    config.gemini.apiKey = undefined;

    await expect(generateTrip(request)).rejects.toMatchObject({ status: 400 });
  });

  it("asks for JSON with thinking off, then normalizes the reply", async () => {
    const fetchMock = modelReplies(
      JSON.stringify({ title: "Pink City", days: [{ stops: [{ name: "Hawa Mahal" }] }] })
    );

    const trip = await generateTrip(request);

    expect(trip.title).toBe("Pink City");
    expect(trip.days[0].stops[0].name).toBe("Hawa Mahal");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers["x-goog-api-key"]).toBe("test-key");
    expect(JSON.parse(init.body).generationConfig).toMatchObject({
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 }
    });
  });

  it("answers 502 when the reply isn't JSON", async () => {
    modelReplies("Sorry, I can't plan that trip.");

    await expect(generateTrip(request)).rejects.toMatchObject({ status: 502 });
  });

  it("answers 502, not a crash, when the reply has braces around broken JSON", async () => {
    modelReplies("{title: oops,}");

    await expect(generateTrip(request)).rejects.toMatchObject({ status: 502 });
  });

  it("passes the provider's status and message through on an API error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: "Quota exceeded" } })
    })));

    await expect(generateTrip(request)).rejects.toMatchObject({ status: 429, message: "Quota exceeded" });
  });
});
