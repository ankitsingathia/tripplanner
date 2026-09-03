/**
 * Pull a JSON object out of an LLM response.
 *
 * Even with `responseMimeType: "application/json"` set, models still
 * occasionally wrap output in ```json fences or pad it with prose, so this
 * falls back to slicing between the outermost braces before giving up.
 */
export function extractJson(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const body = fenced?.[1] ?? text;
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(body.slice(start, end + 1));
    }
  }

  return null;
}
