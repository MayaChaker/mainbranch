import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "./safe-callback-url";

describe("safeCallbackUrl", () => {
  it.each([
    ["/communities/react", "/communities/react"],
    ["/blogs?topic=react", "/blogs?topic=react"],
    ["/blogs/hello#comments", "/blogs/hello#comments"],
    ["/", "/"],
  ])("keeps the local path %j", (value, expected) => {
    expect(safeCallbackUrl(value)).toBe(expected);
  });

  it.each([null, undefined, ""])("falls back to / for %j", (value) => {
    expect(safeCallbackUrl(value)).toBe("/");
  });

  it.each([
    "https://evil.com",
    "http://evil.com/communities",
    "//evil.com",
    "/\\evil.com",
    "javascript:alert(1)",
    "communities",
    "//evil.com/steal?x=1",
  ])("refuses %j and falls back to /", (value) => {
    expect(safeCallbackUrl(value)).toBe("/");
  });
});
