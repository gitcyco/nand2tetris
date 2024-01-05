// Note: -1 == true, 0 == false
const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");

class VMTranslator {
  constructor(file) {
    this.rootName = path.basename(file, ".vm");
    this.eqJMPNum = 0;
    this.gtJMPNum = 0;
    this.ltJMPNum = 0;
    this.staticNum = 0;
    this.rA = "__temp_register_A";
    this.rB = "__temp_register_B";
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
    console.log("ASSEMBLY:", this.assembly);
  }

  translate(ast) {
    const assembly = [];
    for (let item of ast) {
      switch (item.command) {
        case "pop":
          assembly.push(this.pop(item.register, item.offset, item.source));
          break;

        default:
          break;
      }
    }
    return assembly;
  }

  pop(register, offset, source) {
    const assembly = [];
    switch (register) {
      case "LCL":
      case "ARG":
      case "THIS":
      case "THAT":
      case "R13":
      case "R14":
      case "R15":
        assembly.push(`// ${source}`);
        assembly.push(`@SP`);
        assembly.push(`M=M-1`);
        assembly.push(`@${register}`);
        assembly.push(`D=A`);
        assembly.push(`@${offset}`);
        assembly.push(`D=D+A`);
        assembly.push(`@${this.rA}`);
        assembly.push(`M=D`);
        assembly.push(`@SP`);
        assembly.push(`D=M`);
        assembly.push(`@${this.rA}`);
        assembly.push(`A=M`);
        assembly.push(`M=D`);
        break;
      case "STATIC":
        // IMPLEMENT STATIC
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
    return assembly;
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
            const obj = { command, register, offset, source: item };
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
            const obj = { command, source: item };
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
