import CryptoJS from 'crypto-js';

const SecretKey = import.meta.env.VITE_SECRET_KEY;

export const e = (data) => {
  if (data) {
    const encryptedData = CryptoJS.AES.encrypt(data.toString(), SecretKey).toString();
    return encryptedData.replace(/\//g, ';');
  }
};

export const d = (encryptedData) => {
  if (encryptedData) {
    encryptedData = encryptedData.replace(/;/g, '/');
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, SecretKey).toString(
      CryptoJS.enc.Utf8,
    );
    return decryptedData;
  }
};
