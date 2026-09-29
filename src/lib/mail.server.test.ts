import { afterEach, describe, expect, it, vi } from "vitest";
import net from "node:net";

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { from: () => ({ insert: () => Promise.resolve({ error: null }) }) },
}));

/** Minimaler SMTP-Server, der Nachrichten annimmt und sammelt. */
function startSmtp(): Promise<{ port: number; messages: string[]; close: () => void }> {
  const messages: string[] = [];
  const server = net.createServer((sock) => {
    let data = "";
    let inData = false;
    sock.write("220 test ESMTP\r\n");
    sock.on("data", (chunk) => {
      const text = chunk.toString();
      if (inData) {
        data += text;
        if (data.endsWith("\r\n.\r\n")) {
          messages.push(data);
          data = "";
          inData = false;
          sock.write("250 OK queued\r\n");
        }
        return;
      }
      for (const line of text.split("\r\n").filter(Boolean)) {
        const cmd = line.slice(0, 4).toUpperCase();
        if (cmd === "EHLO" || cmd === "HELO") sock.write("250 test\r\n");
        else if (cmd === "DATA") {
          inData = true;
          sock.write("354 go\r\n");
        } else if (cmd === "QUIT") sock.end("221 bye\r\n");
        else sock.write("250 OK\r\n");
      }
    });
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () =>
      resolve({
        port: (server.address() as net.AddressInfo).port,
        messages,
        close: () => server.close(),
      }),
    ),
  );
}

afterEach(() => {
  vi.resetModules();
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.MAIL_FROM;
});

describe("mail.server", () => {
  it("sendet nichts ohne SMTP-Konfiguration", async () => {
    const { enqueueEmail } = await import("./mail.server");
    expect(
      await enqueueEmail({ to: "a@b.de", subject: "s", html: "h", text: "t", template: "x" }),
    ).toBe(false);
  });

  it("liefert Mail über SMTP aus", async () => {
    const smtp = await startSmtp();
    process.env.SMTP_HOST = "127.0.0.1";
    process.env.SMTP_PORT = String(smtp.port);
    process.env.MAIL_FROM = "Auto Semmel <info@example.de>";
    const { enqueueEmail } = await import("./mail.server");
    const ok = await enqueueEmail({
      to: "kunde@example.de",
      subject: "Terminbestätigung",
      html: "<p>Hallo</p>",
      text: "Hallo",
      template: "test",
    });
    smtp.close();
    expect(ok).toBe(true);
    expect(smtp.messages).toHaveLength(1);
    expect(smtp.messages[0]).toContain("kunde@example.de");
    expect(smtp.messages[0]).toContain("Terminbest");
  });
});
