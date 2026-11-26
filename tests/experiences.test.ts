import { describe, expect, test } from "bun:test";
import { experiences } from "../src/lib/experiences";

describe("experience dates", () => {
  test("UTARI runs from January to May 2026", () => {
    expect(experiences.find(({ id }) => id === "utari-composite-research")?.date).toBe("JAN 2026 - MAY 2026");
  });
  test("Safran runs from June to December 2026", () => {
    expect(experiences.find(({ id }) => id === "work-safran")?.date).toBe("JUN 2026 - DEC 2026");
  });
});