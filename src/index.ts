import * as webpack from "webpack";
import * as loaderUtils from "loader-utils";
import validateOptions from "schema-utils";
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
  salt?: string,
  password: string
}

function loader(this: webpack.loader.LoaderContext, content: any): Buffer {
  // Result can be cached
  this.cacheable && this.cacheable();

  // Get and validate options
  const options = loaderUtils.getOptions(this) as unknown as Options;

  validateOptions(validationSchema as Schema, options, validationErrorOptions);

  // Derive Key from password
  const key = getKey(options.password, options.salt);

  // Run Decryption
  const decipher = getDecipher(key, getIVFromBuffer(content));

  return Buffer.concat([decipher.update(getCipherTextFromBuffer(content)), decipher.final()]);
}

export = loader;
