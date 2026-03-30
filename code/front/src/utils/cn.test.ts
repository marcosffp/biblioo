import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("concatena classes válidas ignorando valores falsy", () => {
    expect(cn("btn", false, undefined, "active", null)).toBe("btn active");
  });
});
