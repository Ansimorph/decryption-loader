const compiler = require("./compiler.js");
const cryptoUtils = require("../dist/cryptoUtils");
const del = require("del");

const FILENAME = "test/fixture.txt";
const FILENAME_ENCRYPTED = "test/fixture.txt.enc";

async function enAndDecrypt(options) {
  // Encrypt
  cryptoUtils.encryptFile(FILENAME, options.password, options.salt);

  // Decrypt
  const webpackConfig = {
    loader: {
      options: options,
    },
  };

  return compiler("../" + FILENAME_ENCRYPTED, webpackConfig).then((stats) => {
    const { source } = stats.toJson().modules[0];
    expect(source).toContain('The Truth');

    del.sync(FILENAME_ENCRYPTED);
  });
}

test("Decrypt with default settings", () => {
  return enAndDecrypt({ password: "passwörd" });
});

test("Decrypt with custom salt", () => {
  return enAndDecrypt({
    password: "passlörd",
    salt: "pepper",
  });
});
