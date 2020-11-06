import { getOptions } from 'loader-utils';
import { validate } from 'schema-utils';
import validationSchema from "./options-schema.json";
import {
  Schema,
  ValidationErrorConfiguration,
} from "schema-utils/declarations/validate";
import { getKey, getDecipher, getIVFromBuffer, getCipherTextFromBuffer } from "./cryptoUtils";

const validationErrorOptions = {
  name: "Decryption Loader",
} as ValidationErrorConfiguration;

interface Options {
  password: string
}

function loader(this: Options, content: any): Buffer {
  // Get and validate options
  const options = getOptions<Options>(this);

  validate(validationSchema as Schema, options, validationErrorOptions);

  // Derive Key from password
  const key = getKey(options.password);

  // Run Decryption
  const decipher = getDecipher(key, getIVFromBuffer(content));

  return Buffer.concat([decipher.update(getCipherTextFromBuffer(content)), decipher.final()]);
}

export = loader;
