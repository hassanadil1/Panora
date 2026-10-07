import { describe, it, expect } from "vitest";
import { isAllowedEmbedHost, isAllowedEmbedUrl } from "./allowlist";

describe("isAllowedEmbedHost", () => {
  it("allows my.matterport.com", () => {
    expect(
      isAllowedEmbedHost("my.matterport.com", ["my.matterport.com"])
    ).toBe(true);
  });

  it("blocks evil.com", () => {
    expect(isAllowedEmbedHost("evil.com", ["my.matterport.com"])).toBe(false);
  });
});

describe("isAllowedEmbedUrl", () => {
  it("checks URL hostname", () => {
    expect(
      isAllowedEmbedUrl("https://my.matterport.com/show/?m=x", [
        "my.matterport.com",
      ])
    ).toBe(true);
  });
});
