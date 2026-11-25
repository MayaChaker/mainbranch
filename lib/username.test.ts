import { describe, expect, it } from "vitest";
import { usernameFromName } from "./username";

describe("usernameFromName", () => {
  it.each([
    ["Maya Chaker", "maya-chaker"],
    ["Ali", "ali"],
    ["  Maya   Chaker  ", "maya-chaker"],
    ["O'Neil_99", "o-neil-99"],
    ["--Maya--", "maya"],
  ])("turns %j into %j", (name, expected) => {
    expect(usernameFromName(name)).toBe(expected);
  });

  it.each([null, undefined, "", "   ", "مايا", "A"])(
    "falls back to dev for %j",
    (name) => {
      expect(usernameFromName(name)).toBe("dev");
    },
  );

  it("never exceeds 20 characters or ends with a dash", () => {
    const result = usernameFromName("abcdefghij klmnopqr stuvwxyz");
    expect(result).toBe("abcdefghij-klmnopqr");
  });
});
