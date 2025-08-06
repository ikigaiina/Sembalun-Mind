import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'super-secret-key';

// Function to convert Uint8Array to CryptoJS WordArray
const Uint8ArrayToWordArray = (u8a: Uint8Array) => {
  const words: number[] = [];
  let i = 0;
  for (; i < u8a.length; i++) {
    words[i >>> 2] |= (u8a[i] & 0xFF) << (24 - (i % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, u8a.length);
};

// Function to convert CryptoJS WordArray to Uint8Array
const WordArrayToUint8Array = (wordArray: CryptoJS.lib.WordArray) => {
  const l = wordArray.sigBytes;
  const u8a = new Uint8Array(l);
  for (let i = 0; i < l; i++) {
    const byte = (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xFF;
    u8a[i] = byte;
  }
  return u8a;
};

export const encryptData = (data: Uint8Array): string => {
  const wordArray = Uint8ArrayToWordArray(data);
  return CryptoJS.AES.encrypt(wordArray, SECRET_KEY).toString();
};

export const decryptData = (ciphertext: string): Uint8Array => {
  const decryptedWordArray = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return WordArrayToUint8Array(decryptedWordArray);
};