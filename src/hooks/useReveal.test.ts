import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, render, act } from "@testing-library/react";
import React from "react";
import { useReveal } from "./useReveal";

describe("useReveal", () => {
  let observerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observerMock = vi.fn();
    (window as any).IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        observerMock(cb);
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts not visible", () => {
    const { result } = renderHook(() => useReveal());
    expect(result.current.visible).toBe(false);
    expect(result.current.ref.current).toBeNull();
  });

  it("becomes visible on intersect", () => {
    function Harness() {
      const { ref, visible } = useReveal();
      return React.createElement(
        "div",
        null,
        React.createElement("div", { ref, "data-testid": "target" }),
        React.createElement("span", { "data-testid": "visible" }, String(visible))
      );
    }
    const { getByTestId } = render(React.createElement(Harness));
    expect(getByTestId("visible").textContent).toBe("false");

    const cb = observerMock.mock.calls[0][0];
    expect(typeof cb).toBe("function");

    const entry = [{ isIntersecting: true, target: null }] as any;
    act(() => cb(entry));
    expect(getByTestId("visible").textContent).toBe("true");
  });
});
