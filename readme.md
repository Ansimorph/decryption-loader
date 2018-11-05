[![npm][npm]][npm-url]

# Decryption Loader

Decrypt assets that were encrypted with [node-cipher][node-cipher-url] in webpack

## Why?

If your public repository includes files you can't share with the world, one solution is to encrypt them. [node-cipher][node-cipher-url] is a node-based cli for this purpose. Decryption-loader allows you to decrypt encrypted assets at build-time right in webpack.

## Install

```bash
npm install decryption-loader
```

To encrypt files, install [node-cipher][node-cipher-url]:

```bash
npm install node-cipher -g
```

## Usage

**webpack.config.js**

```js
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.cast5$/,
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

Decryption loader mirrors the [options available in node-cipher][https://github.com/nathanbuchar/node-cipher/blob/master/docs/using-the-node-js-api.md#options]:

-   **`password`** (string) _required_: The password used to derive the encryption key
-   **`algorithm`** (string): The algorithm used to encrypt the data. Run `nodecipher -A` for a complete list of available algorithms. Default is _cast5_
-   **`salt`** (string): The salt used to derive the encryption key. Default is _nodecipher_
-   **`iterations`** (number): The number of iterations used to derive the key. Default is _1000_
-   **`keylen`** (number): The byte length of the derived key. Default is _512_
-   **`digest`** (string): The hash function used to derive the key. Run `nodecipher -H` for a complete list of available hash algorithms Default is _sha1_

## An Example

### 1: Encrypt

Say you have `font.woff`, a commercial font that you want to include in your public repository, but can't because of licensing issues. Let's encrypt it to solve this problem:

```bash
nodecipher enc font.woff font.woff.cast5 -p password
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
                test: /\.(cast5)$/,
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

And we're done. The encrypted file is now decrypted and then processed by file-loader as `font.woff`. You can reference the encrypted file `font.woff.cast5` in your CSS like a normal font file.

[npm]: https://img.shields.io/npm/v/decryption-loader.svg
[npm-url]: https://npmjs.com/package/decryption-loader
[node-cipher-url]: https://www.npmjs.com/package/node-cipher
