import { describe, expect, it } from "vitest";
import { buildReportCsv, emptyMonths } from "./report";

describe("report", () => {
  it("erzeugt Excel-taugliches CSV mit Summenzeile", () => {
    const rows = emptyMonths();
    rows[0]!.leads = 3;
    rows[0]!.leadsAnkauf = 1;
    rows[1]!.leads = 2;
    rows[1]!.termineBestaetigt = 5;
    const csv = buildReportCsv(2026, rows);
    const lines = csv.replace("﻿", "").trim().split("\r\n");
    expect(csv.startsWith("﻿")).toBe(true);
    expect(lines).toHaveLength(14); // Kopf + 12 Monate + Summe
    expect(lines[1]).toBe("Januar 2026;3;0;1;0;0;0;0;0;0");
    expect(lines[13]).toBe("Summe 2026;5;0;1;0;5;0;0;0;0");
  });
});
