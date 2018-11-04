const crypto = require("crypto");
const loaderUtils = require("loader-utils");
const validateOptions = require("schema-utils");
const schema = require("./options-schema.json");

const defaultOptions = {
    algorithm: "cast5-cbc",
    salt: "nodecipher",
    digest: "sha1",
    iterations: 1000,
    keylen: 512,
};

module.exports = function decrypt(ciphertext) {
    // Result can be cached
    if (this.cacheable) this.cacheable();

    // Get and validate options
    const options = Object.assign(
        {},
        defaultOptions,
        loaderUtils.getOptions(this),
    );

    validateOptions(schema, options, "Decryption Loader");

    // Derive Key from password
    const key = crypto.pbkdf2Sync(
        options.password,
        options.salt,
        options.iterations,
        options.keylen,
        options.digest,
    );

    // Run Decryption
    const decipher = crypto.createDecipher(
        options.algorithm,
        key.toString("hex"),
    );

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};

// This loader works on buffers
module.exports.raw = true;
