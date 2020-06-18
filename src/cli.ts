import inquirer from "inquirer";
import minimist from "minimist";
import { encryptFile } from "./cryptoUtils";

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

export function main() {
  const argv = minimist(process.argv.slice(2));
  const fileName = argv._[0];

  if (!fileName) {
    fail();
    return;
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
      console.log(`Sucessfully encrypted to: ${fileName}.enc`);
    });
}
