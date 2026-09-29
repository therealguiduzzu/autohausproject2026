import { describe, expect, it } from "vitest";
import { SITE_URL, siteUrl } from "./site";

describe("site", () => {
  it("hat keine abschließenden Slashes", () => {
    expect(SITE_URL.endsWith("/")).toBe(false);
  });

  it("baut absolute URLs mit und ohne führenden Slash", () => {
    expect(siteUrl("/impressum")).toBe(`${SITE_URL}/impressum`);
    expect(siteUrl("impressum")).toBe(`${SITE_URL}/impressum`);
    expect(siteUrl()).toBe(SITE_URL);
  });
});
