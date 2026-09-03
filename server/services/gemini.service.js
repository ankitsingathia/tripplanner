import { config } from "../config/index.js";
import { HttpError, badRequest } from "../lib/http-error.js";
import { extractJson } from "../lib/json.js";
import { buildTripPrompt } from "../domain/trip.prompt.js";
import { normalizeTrip } from "../domain/trip.normalizer.js";

/**
 * Gemini transport. Knows how to call the API and how to fail; knows nothing
 * about Express. Swapping models or providers is contained to this file as
 * long as it keeps returning a normalized trip.
 */
export async function generateTrip(request) {
  const { apiKey, model, endpoint } = config.gemini;

  if (!apiKey) {
    throw badRequest("Missing GEMINI_API_KEY");
  }

  const response = await fetch(`${endpoint}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildTripPrompt(request) }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new HttpError(response.status, payload?.error?.message || "Gemini request failed");
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("\n");
  const parsed = extractJson(text);

  if (!parsed) {
    throw new HttpError(502, "Gemini returned a response that could not be parsed as JSON.");
  }

  return normalizeTrip(parsed, request);
}
