import QRCode from "qrcode";

export async function generateQRCode(text: string) {
  return QRCode.toDataURL(text);
}