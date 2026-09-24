import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WhatsAppButton from "./WhatsAppButton";

/**
 * UI-Regressionstest:
 * Stellt sicher, dass der „Jetzt live chatten"-Button (WhatsApp-CTA)
 * keinen pulsierenden/blinkenden Effekt mehr enthält – auch nicht nach
 * mehreren Re-Renders.
 */
describe("WhatsAppButton – kein Ping/Pulse-Effekt", () => {
  const PING_CLASSES = ["animate-ping", "animate-pulse", "pulse"];

  function assertNoPingEffect(root: HTMLElement) {
    // 1) Der CTA selbst trägt keine Animations-Klasse
    const cta = root.querySelector('a[aria-label="Jetzt live über WhatsApp chatten"]');
    expect(cta, "WhatsApp CTA muss gerendert sein").not.toBeNull();
    expect(cta!.className).toContain("whatsapp-static");
    for (const cls of PING_CLASSES) {
      expect(cta!.className).not.toContain(cls);
    }
    expect((cta as HTMLElement).style.animation).toBe("none");
    expect((cta as HTMLElement).style.transition).toBe("none");

    // 2) Auch kein Kind-Element (z. B. Overlay-Span) darf pulsen/pingen
    const animated = cta!.querySelectorAll(
      PING_CLASSES.map((c) => `.${c}`).join(","),
    );
    expect(animated.length).toBe(0);

    for (const child of cta!.querySelectorAll<HTMLElement>("[style]")) {
      expect((child as HTMLElement).style.animation).toBe("none");
      expect((child as HTMLElement).style.transition).toBe("none");
    }
  }

  it("rendert ohne Ping/Pulse-Klassen", () => {
    const { container } = render(<WhatsAppButton />);
    assertNoPingEffect(container);
    expect(screen.getByText("Jetzt live chatten")).toBeDefined();
  });

  it("bleibt auch nach mehreren Re-Renders ohne Ping/Pulse-Effekt", () => {
    const { container, rerender } = render(<WhatsAppButton />);
    for (let i = 0; i < 5; i++) {
      rerender(<WhatsAppButton />);
      assertNoPingEffect(container);
    }
  });
});
