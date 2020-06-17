import inquirer from "inquirer";
import { encryptFile } from "./cryptoUtils";

const fileName = process.argv[2];

function cannotBeEmpty(value: string) {
  if (value && value !== "") {
    return true;
  }

  return "Password cannot be empty";
}

function fail() {
  console.log("Usage: node cli.ts FILENAME");
  process.exit(1);
}

function main() {
  if (!fileName) {
    fail();
  }

  inquirer
    .prompt([
      {
        type: "password",
        message: "Enter a password",
        name: "password",
        validate: cannotBeEmpty,
      },
    ])
    .then((answers) => {
      encryptFile(fileName, answers.password);
    });
}

main();
