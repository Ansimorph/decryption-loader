const path = require("path");
const exec = require("child_process").exec;
const compiler = require("./compiler.js");
const del = require("del");

const FILENAME = "./test/fixture.txt";
const FILENAME_ENCRYPTED = "./test/fixture.txt.enc";
const PASSWORD = "PASSWORD";

// Calls CLI with command line args and enters password
function cli(args, password) {
  const CWD = ".";

  return new Promise((resolve) => {
    const childProcess = exec(
      `node ${path.resolve("./cli.js")} ${args.join(" ")}`,
      { CWD },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr,
        });
      }
    );

    if (password) {
      process.nextTick(() => {
        childProcess.stdin.write(password + "\n");
      });
    }
  });
}

test("Should fail without filename", async () => {
  let result = await cli([]);
  expect(result.code).toBe(1);
});

test("Should encrypt and decrypt", async () => {
  // Encrypt with CLI
  const result = await cli([FILENAME], PASSWORD);
  expect(result.code).toBe(0);

  // Decrypt with Webpack
  const webpackConfig = {
    loader: {
      options: { password: PASSWORD },
    },
  };

  return compiler("../" + FILENAME_ENCRYPTED, webpackConfig).then((stats) => {
    const { source } = stats.toJson().modules[0];
    expect(source).toContain("The Truth");

    del.sync(FILENAME_ENCRYPTED);
  });
});
