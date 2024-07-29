import CryptoJS from 'crypto-js';

// Parse the AES key from environment variables
const key = import.meta.env.VITE_AES_KEY;
const parsedKey = CryptoJS.enc.Hex.parse(key);

/**
 * Encrypt a JSON string.
 * @param {string} text - The JSON string to encrypt.
 * @returns {string} The encrypted text in the format "IV:EncryptedText".
 */
export const handleEncrypt = (text) => {
  if (text) {
    try {
      const jsonObject = JSON.parse(text);
      const jsonString = JSON.stringify(jsonObject);

      const iv = CryptoJS.lib.WordArray.random(16); // Generate a random IV
      const encrypted = CryptoJS.AES.encrypt(jsonString, parsedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
      const ivBase64 = iv.toString(CryptoJS.enc.Base64);
      return `${ivBase64}:${encryptedBase64}`;
    } catch (error) {
      console.error('Invalid JSON input:', error);
      return error;
    }
  }
};

/**
 * Decrypt an encrypted text.
 * @param {string} decryptionInput - The encrypted text in the format "IV:EncryptedText".
 * @returns {string} The decrypted JSON string.
 */
export const handleDecrypt = (decryptionInput) => {
  if (decryptionInput) {
    const [ivBase64, encryptedBase64] = decryptionInput.split(':');
    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const encryptedCiphertext = CryptoJS.enc.Base64.parse(encryptedBase64);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encryptedCiphertext },
      parsedKey,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
};
