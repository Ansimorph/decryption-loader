import {
  pbkdf2Sync,
  BinaryLike,
  createDecipheriv,
  createCipheriv,
  randomBytes,
} from "crypto";
import { createReadStream, createWriteStream } from "fs";
import * as path from "path";
import AppendInitVector from "./AppendInitVector";

const ITERATIONS = 1000;
const KEY_LENGTH = 32;
const DIGEST = "sha1";
const CIPHER = "aes-256-cbc";
const DEFAULT_SALT = "salty";
const IV_LENGTH = 16;

export function getKey(
  password: BinaryLike,
  salt: BinaryLike = DEFAULT_SALT
): Buffer {
  return pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
}

export function getDecipher(key: Buffer, iv: Buffer) {
  return createDecipheriv(CIPHER, key, iv);
}

export function getCipher(key: Buffer, iv: Buffer) {
  return createCipheriv(CIPHER, key, iv);
}

export function getIVFromBuffer(buffer: Buffer): Buffer {
  const iv = Buffer.alloc(IV_LENGTH);
  buffer.copy(iv, 0, 0, IV_LENGTH);

  return iv;
}

export function getCipherTextFromBuffer(buffer: Buffer): Buffer {
  const ciphertext = Buffer.alloc(buffer.length - IV_LENGTH);
  buffer.copy(ciphertext, 0, IV_LENGTH, buffer.length);

  return ciphertext;
}

export function encryptFile(file: string, key: string, salt?: string) {
  // Generate a secure, pseudo random initialization vector.
  const initVector = randomBytes(IV_LENGTH);

  // Generate a cipher key from the password.
  const readStream = createReadStream(file);
  const cipher = getCipher(getKey(key, salt), initVector);
  const appendInitVector = new AppendInitVector(initVector);
  // Create a write stream with a different file extension.
  const writeStream = createWriteStream(path.join(file + ".enc"));

  readStream.pipe(cipher).pipe(appendInitVector).pipe(writeStream);
}
