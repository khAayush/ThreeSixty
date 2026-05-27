import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// Key is resolved lazily so dotenv has loaded before first use
let _key = null;
const getKey = () => {
  if (!_key) _key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  return _key;
};

export const encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // wire format: 12 bytes iv | 16 bytes auth tag | ciphertext
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

export const decrypt = (data) => {
  try {
    const buf = Buffer.from(data, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    // Return as-is if decryption fails 
    return data;
  }
};
