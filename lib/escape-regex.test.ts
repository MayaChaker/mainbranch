import { describe, expect, it } from "vitest";
import { escapeRegex } from "./escape-regex";

describe("escapeRegex", () => {
  it("leaves plain text unchanged", () => {
    expect(escapeRegex("react native")).toBe("react native");
  });

  it.each([".*", "(a+)+$", "c++", "[js]", "a|b", "^node\\"])(
    "makes %j match only itself",
    (text) => {
      const regex = new RegExp(`^${escapeRegex(text)}$`);
      expect(regex.test(text)).toBe(true);
      expect(regex.test("something else")).toBe(false);
    },
  );
});
