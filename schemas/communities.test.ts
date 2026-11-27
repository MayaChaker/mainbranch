import { describe, expect, it } from "vitest";
import { communitiesQuerySchema } from "./communities";

const parse = (input: Record<string, unknown>) =>
  communitiesQuerySchema.safeParse(input);

describe("communitiesQuerySchema", () => {
  it("uses page 1 and no search by default", () => {
    expect(parse({}).data).toEqual({ page: 1 });
  });

  it("turns the page text from the URL into a number", () => {
    expect(parse({ page: "3" }).data?.page).toBe(3);
  });

  it("trims the search text", () => {
    expect(parse({ search: "  react  " }).data?.search).toBe("react");
  });

  it("treats an empty search as no search", () => {
    expect(parse({ search: "   " }).data?.search).toBeUndefined();
  });

  it.each(["0", "-1", "1.5", "abc", "1001"])("refuses page %j", (page) => {
    expect(parse({ page }).success).toBe(false);
  });

  it("refuses a search longer than 50 characters", () => {
    expect(parse({ search: "a".repeat(51) }).success).toBe(false);
  });
});
