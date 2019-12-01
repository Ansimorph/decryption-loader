const compiler = require("./compiler.js");
const nodecipher = require("node-cipher");
const crypto = require("crypto");
const del = require("del");

async function enAndDecrypt(options) {
    // Generate unique filename for encrypted file
    const hash = crypto
        .createHash("md5")
        .update(JSON.stringify(options))
        .digest("hex");
    const filename = `fixture.txt.${hash}.enc`;

    // Encrypt
    const nodecipherConfig = {
        input: "test/fixture.txt",
        output: `test/${filename}`,
    };

    nodecipher.encryptSync(Object.assign(nodecipherConfig, options));

    // Decrypt
    const webpackConfig = {
        loader: {
            options: options,
        },
    };

    return compiler(`${filename}`, webpackConfig).then(stats => {
        const { source } = stats.toJson().modules[0];
        expect(source).toBe("export default \"The Truth\";");

        del.sync(`test/${filename}`);
    });
}

test("Decrypt with default settings", () => {
    return enAndDecrypt({ password: "passwörd" });
});

test("Decrypt with non-default settings", () => {
    return enAndDecrypt({
        password: "passlörd",
        algorithm: "aes-128-cbc",
        salt: "pepper",
        iterations: 2,
        keylen: 256,
        digest: "md5",
    });
});
