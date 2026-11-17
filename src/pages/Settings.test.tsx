import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Settings from "./Settings";
import { useStore } from "../store/useStore";

beforeEach(() => {
  localStorage.removeItem("rencanai-store");
  useStore.getState().resetStore();
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.removeItem("rencanai-store");
  useStore.getState().resetStore();
});

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={["/settings"]}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MemoryRouter>
  );
}

function providerSelect() {
  return screen.getAllByRole("combobox")[0];
}

function modelSelect() {
  return screen.getAllByRole("combobox")[1];
}

describe("Settings", () => {
  it("Simpan menyimpan provider, apiKey, dan model ke store", () => {
    renderSettings();
    fireEvent.change(providerSelect(), { target: { value: "openrouter" } });
    const input = screen.getByPlaceholderText("Enter API key");
    fireEvent.change(input, { target: { value: "sk-test-123" } });
    fireEvent.change(modelSelect(), { target: { value: "openrouter/free" } });
    fireEvent.click(screen.getByRole("button", { name: /save settings/i }));
    expect(useStore.getState().settings).toEqual({
      provider: "openrouter",
      apiKey: "sk-test-123",
      model: "openrouter/free",
    });
  });

  it("opsion model menyesuaikan penyedia yang dipilih", () => {
    renderSettings();
    expect(screen.getByRole("option", { name: "Gemini 3.8 Flash" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Free Router (auto)" })).not.toBeInTheDocument();
    fireEvent.change(providerSelect(), { target: { value: "openrouter" } });
    expect(screen.getByRole("option", { name: "Free Router (auto)" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Gemini 3.8 Flash" })).not.toBeInTheDocument();
  });

  it("Ekspor Semua PRD (JSON) memicu unduhan tanpa mengubah settings", () => {
    useStore.getState().addPrd({
      id: "p1",
      title: "Judul PRD",
      description: "deskripsi singkat",
      content: "# x",
      tasks: [],
      createdAt: 1,
      updatedAt: 1,
    });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");
    renderSettings();
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /export all PRDs \(JSON\)/i }));
    });
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(useStore.getState().settings).toBeNull();
  });
});
