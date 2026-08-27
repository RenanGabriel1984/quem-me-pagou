import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function generatePixPayload(
  pixKey: string,
  amount: number,
  merchantName: string,
  description: string,
): string {
  // Simplified PIX payload for QR code
  const addField = (id: string, value: string) =>
    `${id}${String(value.length).padStart(2, "0")}${value}`;

  const merchantAccountInfo =
    addField("00", "br.gov.bcb.pix") + addField("01", pixKey);

  const payload = [
    addField("00", "01"), // Payload Format
    addField("01", amount > 0 ? "12" : "11"), // Point of Initiation: 12 = dynamic, 11 = static
    addField("26", merchantAccountInfo), // Merchant Account Info
    addField("52", "0000"), // Merchant Category Code
    addField("53", "986"), // Transaction Currency (BRL)
    addField("54", amount > 0 ? amount.toFixed(2) : "0.00"), // Transaction Amount
    addField("58", "BR"), // Country Code
    addField("59", merchantName.slice(0, 25)), // Merchant Name
    addField("60", description.slice(0, 25)), // Merchant City
    addField("62", addField("05", "")), // Additional Data (TXID placeholder)
  ].join("");

  // Calculate CRC16 (CCITT)
  let crc = 0x0000;
  const dataToEncode = payload + "6304";
  for (let i = 0; i < dataToEncode.length; i++) {
    crc ^= dataToEncode.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, "0");

  return payload + "6304" + crcHex;
}

export function PixCopyButton({
  pixKey,
  amount,
  ownerName,
  description,
}: {
  pixKey: string;
  amount: number;
  ownerName: string;
  description: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast.success("Chave PIX copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Falha ao copiar chave PIX");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 gap-1.5 rounded-lg border-border/40 text-xs min-w-[44px] min-h-[44px]"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="size-3.5 text-[var(--paid)]" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copiado!" : "Copiar Chave PIX"}
    </Button>
  );
}

export function PixQRCode({
  pixKey,
  amount,
  ownerName,
  description,
}: {
  pixKey: string;
  amount: number;
  ownerName: string;
  description: string;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!show || !pixKey) return;
    const payload = generatePixPayload(
      pixKey,
      amount,
      ownerName || "Quem Me Pagou",
      description,
    );
    QRCode.toDataURL(payload, {
      width: 200,
      margin: 2,
      color: {
        dark: "#1a1a2e",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    }).then(setQrDataUrl);
  }, [show, pixKey, amount, ownerName, description]);

  if (!pixKey) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 rounded-lg border-border/40 text-xs min-w-[44px] min-h-[44px]"
        onClick={() => setShow(true)}
      >
        <QrCode className="size-3.5" />
        QR Code
      </Button>

      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShow(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border/60 rounded-2xl p-6 shadow-2xl text-center max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold mb-1">QR Code PIX</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Escaneie para pagar {amount > 0 ? `R$ ${amount.toFixed(2)}` : ""}
            </p>
            {qrDataUrl ? (
              <div className="qr-container mx-auto inline-block">
                <img src={qrDataUrl} alt="QR Code PIX" className="w-48 h-48" />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto skeleton rounded-xl" />
            )}
            <p className="text-[10px] text-muted-foreground mt-3 break-all px-2">
              {pixKey}
            </p>
            <Button
              variant="ghost"
              className="mt-4 w-full h-11 rounded-xl"
              onClick={() => setShow(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
