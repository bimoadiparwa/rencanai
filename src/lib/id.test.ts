import { describe, it, expect, vi, afterEach } from "vitest";
import { makeId } from "./id";

afterEach(() => vi.unstubAllGlobals());

describe("makeId", () => {
  it("returns a UUID v4 string", () => {
    expect(makeId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("works when randomUUID is unavailable (plain http, non-secure context)", () => {
    vi.stubGlobal("crypto", { getRandomValues: (a: Uint8Array) => a.fill(7) });
    expect(makeId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
