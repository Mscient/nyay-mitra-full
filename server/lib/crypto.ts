import crypto from "crypto";

const getAlgorithm = () => "aes-256-gcm";

const getKey = (): Buffer => {
  const secret = process.env.AES_SECRET_KEY;
  if (secret && typeof secret === "string") {
    const key = Buffer.from(secret, "hex");
    if (key.length === 32) return key;
  }
  return crypto.scryptSync("nyay-mitra-development-key", "salt", 32);
};

export function encryptPII(text: string | null | undefined): string | null | undefined {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(getAlgorithm(), getKey(), iv) as crypto.CipherGCM;
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (e) {
    console.error("Encryption failed:", e);
    return text;
  }
}

export function decryptPII(cipherText: string | null | undefined): string | null | undefined {
  if (!cipherText || typeof cipherText !== "string" || !cipherText.includes(":")) {
    return cipherText; 
  }
  try {
    const parts = cipherText.split(":");
    if (parts.length !== 3) return cipherText;
    const [ivHex, authTagHex, encryptedHex] = parts;
    const decipher = crypto.createDecipheriv(getAlgorithm(), getKey(), Buffer.from(ivHex, "hex")) as crypto.DecipherGCM;
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    console.error("Decryption failed:", e);
    return cipherText;
  }
}
