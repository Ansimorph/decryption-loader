[![npm][npm]][npm-url]
[![Actions Status](https://github.com/Ansimorph/decryption-loader/workflows/Node%20CI/badge.svg)](https://github.com/Ansimorph/decryption-loader/actions)

# Decryption Loader

Decrypt assets with webpack

## Why?

If your public repository includes files you can't share with the world, one solution is to encrypt them. Decryption-loader allows you to encrypt assets via CLI and decrypt them at build-time right in webpack.

## Install

```bash
npm install decryption-loader
```

## Encryption

```bash
npx decryption-loader example.txt
```

You will be prompted for a password and an encrypted file `example.txt.enc` is created.

## Decryption

**webpack.config.js**

```js
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.enc$/,
                loader: "decryption-loader",
                options: {
                    password: "password",
                },
            },
        ],
    },
    // ...
};
```

Be careful: Your webpack configuration file is probably not a safe place to keep passwords.

## Options

-   **`password`** (string) _required_: The password used to derive the encryption key

## An Example

### 1: Encrypt

Say you have `font.woff`, a commercial font that you want to include in your public repository, but can't because of licensing issues. Let's encrypt it to solve this problem:

```bash
npx decryption-loader font.woff
```

### 2: Store password

We need a save place to store the password. We'll put it in the environment variable `PASSWORD`. We can use [dotenv](https://www.npmjs.com/package/dotenv) to set the variable in the context of our local repo:

```bash
npm install dotenv
```

**.env**

```bash
PASSWORD=password
```

Be sure to add the unencrypted font file and `.env` to your `.gitignore` to keep them out of the public repo:

**.gitignore**

```bash
font.woff
.env
```

### 3: Decrypt

Now we have to decrypt the font at build time using webpack:

**webpack.config.js**

```js
/*  Read variables from .env
    If actual environment variables are set
    the values in .env are ignored */
require("dotenv").config();

module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.(enc)$/,
                use: [
                    {
                        loader: "file-loader",
                        // Not including [ext] strips the .cast5 extension from the filename
                        options: { name: "[name]" },
                    },
                    {
                        loader: "decryption-loader",
                        options: { password: process.env.PASSWORD },
                    },
                ],
            },
        ],
    },
    // ...
};
```

And we're done. The encrypted file is now decrypted and then processed by file-loader as `font.woff`. You can reference the encrypted file `font.woff.enc` in your CSS like a normal font file.

[npm]: https://img.shields.io/npm/v/decryption-loader.svg
[npm-url]: https://npmjs.com/package/decryption-loader
