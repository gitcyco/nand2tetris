// Note: -1 == true, 0 == false
const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");

class VMTranslator {
  constructor(file) {
    this.eqJMPNum = 0;
    this.gtJMPNum = 0;
    this.ltJMPNum = 0;
    this.symbolMap = {
      LOCAL: "LCL",
      ARGUMENT: "ARG",
      THIS: "THIS",
      THAT: "THAT",
      TEMP: "TEMP",
      R13: "R13",
      R14: "R14",
      R15: "R15",
      CONSTANT: "CONSTANT",
      STATIC: "STATIC",
    };
    this.rawFile = this.getRawFile(file);
    this.ast = this.processCommands(this.stripInput(this.rawFile));
    this.assembly = this.translate(this.ast);
    console.log("AST:", this.ast);
  }

  translate(ast) {
    const assembly = [];
    for (let command of ast) {
    }
    return assembly;
  }

  pop(register, offset) {
    const assembly = [];
    switch (register) {
      case "LCL":
      case "ARG":
      case "THIS":
      case "THAT":
      case "R13":
      case "R14":
      case "R15":
        break;
      case "TEMP":
        // IMPLEMENT TEMP
        break;
      case "CONSTANT":
        // IMPLEMENT CONSTANT
        break;
      default:
        break;
    }
  }

  processCommands(input) {
    const ast = [];
    for (let item of input) {
      let [command, ...rest] = item.split(" ");
      console.log(item);
      switch (command) {
        case "push":
        case "pop":
          {
            let [register, offset] = rest;
            register = this.symbolMap[register.toUpperCase()];
            const obj = { command, register, offset };
            ast.push(obj);
          }
          break;
        case "add":
        case "sub":
        case "neg":
        case "eq":
        case "gt":
        case "lt":
        case "and":
        case "or":
        case "not":
          {
            const obj = { command };
            ast.push(obj);
          }
          break;
        default:
          console.error(`Unknown command: ${item}`);
          process.exit(1);
          break;
      }
    }
    return ast;
  }

  getRawFile(fname) {
    try {
      if (fs.existsSync(fname)) {
        const data = fs.readFileSync(fname, "utf8");
        return data;
      } else {
        console.error("Error: input file not found. Exiting...");
        process.exit(1);
      }
    } catch (err) {
      console.error(err);
    }
  }
  stripInput(data) {
    const lines = data.split("\n");
    const output = [];
    for (let line of lines) {
      let clean = line.replace(/\/\/.*/g, "").trim();
      clean = clean.replace(/\s+/g, " ");
      if (clean.length > 0) output.push(clean);
    }
    return output;
  }
}

const args = parseArgs({
  options: {
    help: {
      type: "boolean",
      default: false,
      short: "h",
    },
    output: {
      type: "string",
      default: "",
      short: "o",
    },
  },
  strict: false,
});

if (args.positionals.length === 0) {
  console.error("ERROR: please provide input filename");
  process.exit(1);
}

const inputFile = args.positionals[0];
const vm = new VMTranslator(inputFile);
