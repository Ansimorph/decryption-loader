import { createDecipher, pbkdf2Sync } from "crypto";
import * as webpack from "webpack";
import * as loaderUtils from "loader-utils";
import validateOptions from "schema-utils";
import validationSchema from "./options-schema.json";
import {
  Schema,
  ValidationErrorConfiguration,
} from "schema-utils/declarations/validate";

const defaultOptions = {
  password: "",
  algorithm: "cast5-cbc",
  salt: "nodecipher",
  digest: "sha1",
  iterations: 1000,
  keylen: 512,
};

const validationErrorOptions = {
  name: "Decryption Loader",
} as ValidationErrorConfiguration;

function loader(
  this: webpack.loader.LoaderContext,
  ciphertext: any
): Buffer {
  // Result can be cached
  this.cacheable && this.cacheable();

  // Get and validate options
  const options = {
    ...defaultOptions,
    ...loaderUtils.getOptions(this),
  };

  validateOptions(validationSchema as Schema, options, validationErrorOptions);

  // Derive Key from password
  const key = pbkdf2Sync(
    options.password,
    options.salt,
    options.iterations,
    options.keylen,
    options.digest
  );

  // Run Decryption
  const decipher = createDecipher(options.algorithm, key.toString("hex"));

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};

export = loader;
