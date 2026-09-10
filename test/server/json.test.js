import { describe, expect, it } from "vitest";

import { extractJson } from "../../server/lib/json.js";

describe("extractJson", () => {
  it("parses a plain JSON reply", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("unwraps a ```json fence", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("slices between the outer braces when the model pads with prose", () => {
    expect(extractJson('Sure! Here is your trip: {"a":{"b":2}} Enjoy.')).toEqual({ a: { b: 2 } });
  });

  it("returns null for empty input", () => {
    expect(extractJson("")).toBeNull();
    expect(extractJson(undefined)).toBeNull();
  });

  it("returns null when there is no object at all", () => {
    expect(extractJson("I can't help with that.")).toBeNull();
  });

  it("returns null instead of throwing when the braces hold broken JSON", () => {
    expect(extractJson("Here you go: {title: oops,}")).toBeNull();
  });
});
