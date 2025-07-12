import crypto from "crypto";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const privateKeyPath = path.resolve("keys/private.pem");

export function decryptRSA({ aesKey, iv, payload }) {
  console.log("Received AES Key length:", aesKey?.length);
  console.log("Received IV length:", iv?.length);
  console.log("Received Payload length:", payload?.length);

  try {
    const tempEncPath = path.resolve("keys/aeskey.bin");

    // ✅ write base64 string as UTF-8 (NOT base64 buffer)
    fs.writeFileSync(tempEncPath, aesKey, "utf8");

    // 🔓 Decrypt using OpenSSL (it will base64-decode and decrypt)
    const decryptedBuffer = execSync(
      `openssl pkeyutl -decrypt -inkey "${privateKeyPath}" -in "${tempEncPath}"`
    );

    fs.unlinkSync(tempEncPath);

    // The decryptedBuffer is a raw 32-byte key — no base64 decoding needed
    const rawAesKey = decryptedBuffer;

    console.log("🟢 Raw AES Key Length:", rawAesKey.length); // should be 32

    if (rawAesKey.length !== 32) {
      console.error("❌ Invalid AES key length. Got:", rawAesKey.length);
      throw new Error("Invalid AES key length for AES-256");
    }

    // AES decryption
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      rawAesKey,
      Buffer.from(iv, "base64")
    );

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload, "base64")),
      decipher.final(),
    ]).toString("utf8");

    console.log("✅ Decryption successful");
    return decrypted;
  } catch (err) {
    console.error("❌ Decryption failed:", err.message);
    throw new Error("Decryption failed (OpenSSL + AES)");
  }
}
