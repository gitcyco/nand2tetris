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
    // this.rA = this.rootName + "__temp_register_A";
    // this.rB = this.rootName + "__temp_register_B";
    this.symbolMap = {
      LOCAL: "LCL",
      ARGUMENT: "ARG",
      THIS: "THIS",
      THAT: "THAT",
      TEMP: "TEMP",
      // R13: "R13",
      // R14: "R14",
      // R15: "R15",
      CONSTANT: "CONSTANT",
      STATIC: "STATIC",
      POINTER: "POINTER",
    };
    this.rawFile = this.getRawFile(file);
    this.ast = this.processCommands(this.stripInput(this.rawFile));
    this.assembly = this.translate(this.ast);
    console.log("AST:", this.ast);
    console.log("ASSEMBLY:", this.assembly.join("\n"));
  }

  translate(ast) {
    const assembly = [];
    for (let item of ast) {
      assembly.push(`// ${item.source}`);
      switch (item.command) {
        case "pop":
          this.pop(item.register, item.offset, assembly);
          break;
        case "push":
          this.push(item.register, item.offset, assembly);
        case "add":
          this.add(assembly);
        default:
          break;
      }
    }
    return assembly;
  }
  add(assembly) {
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`D=M`);
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`M=D+M`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  sub(assembly) {
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`D=M`);
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`M=M-D`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  and(assembly) {
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`D=M`);
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`M=D&M`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  or(assembly) {
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`D=M`);
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`M=D|M`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  not(assembly) {
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`!M`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  neg(assembly) {
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`-M`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  equal(assembly) {
    // Move y into R13
    // Move x into D
    // Move R13 into A
    // Set *SP to -1
    // Do D - A
    // Jump if zero to eqJumpLabel
    // Set *SP to 0
    // eqJumpLabel:
    // SP + 1
    // (x === y)
    //
    const eqJumpLabel = `eqJMP${this.eqJMPNum++}`;
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`D=M`);
    assembly.push(`@R13`);
    assembly.push(`M=D`);
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`D=M`);
    assembly.push(`M=-1`);
    assembly.push(`@R13`);
    assembly.push(`A=M`);
    assembly.push(`D=D-A`);
    assembly.push(`@${eqJumpLabel}`);
    assembly.push(`D:JEQ`);
    assembly.push(`@SP`);
    assembly.push(`A=M`);
    assembly.push(`M=0`);
    assembly.push(`(${eqJumpLabel})`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  push(register, offset, assembly) {
    switch (register) {
      case "POINTER":
        if (register === "POINTER") {
          register = offset === 0 ? "THIS" : "THAT";
        }
        assembly.push(`@${register}`);
        assembly.push(`D=M`);
        assembly.push(`@SP`);
        assembly.push(`A=M`);
        assembly.push(`M=D`);
        assembly.push(`@SP`);
        assembly.push(`M=M+1`);
        break;
      case "LCL":
      case "ARG":
      case "THIS":
      case "THAT":
        assembly.push(`@${register}`);
        assembly.push(`A=M`);
        assembly.push(`D=M`);
        assembly.push(`@SP`);
        assembly.push(`A=M`);
        assembly.push(`M=D`);
        assembly.push(`@SP`);
        assembly.push(`M=M+1`);
        break;
      case "STATIC":
        assembly.push(`@${this.rootName}.${offset}`);
        assembly.push(`D=M`);
        assembly.push(`@SP`);
        assembly.push(`A=M`);
        assembly.push(`M=D`);
        assembly.push(`@SP`);
        assembly.push(`M=M+1`);
        break;
      case "TEMP":
        assembly.push(`@${5 + offset}`);
        assembly.push(`D=M`);
        assembly.push(`@SP`);
        assembly.push(`A=M`);
        assembly.push(`M=D`);
        assembly.push(`@SP`);
        assembly.push(`M=M+1`);
        break;
      case "CONSTANT":
        assembly.push(`@${offset}`);
        assembly.push(`D=A`);
        assembly.push(`@SP`);
        assembly.push(`A=M`);
        assembly.push(`M=D`);
        assembly.push(`@SP`);
        assembly.push(`M=M+1`);
        break;
      default:
        break;
    }
  }

  pop(register, offset, assembly) {
    // const assembly = [];
    switch (register) {
      case "POINTER":
        register = offset === 0 ? "THIS" : "THAT";
        assembly.push(`@SP`);
        assembly.push(`M=M-1`);
        assembly.push(`A=M`);
        assembly.push(`D=M`);
        assembly.push(`@${register}`);
        assembly.push(`M=D`);
        break;
      case "LCL":
      case "ARG":
      case "THIS":
      case "THAT":
        assembly.push(`@SP`);
        assembly.push(`M=M-1`);
        assembly.push(`@${register}`);
        assembly.push(`D=A`);
        assembly.push(`@${offset}`);
        assembly.push(`D=D+A`);
        assembly.push(`@R13`);
        assembly.push(`M=D`);
        assembly.push(`@SP`);
        assembly.push(`D=M`);
        assembly.push(`@R13`);
        assembly.push(`A=M`);
        assembly.push(`M=D`);
        break;
      case "STATIC":
        assembly.push(`@SP`);
        assembly.push(`M=M-1`);
        assembly.push(`D=M`);
        assembly.push(`@${this.rootName}.${offset}`);
        assembly.push(`M=D`);
        break;
      case "TEMP":
        assembly.push(`@SP`);
        assembly.push(`M=M-1`);
        assembly.push(`D=M`);
        assembly.push(`@${5 + offset}`);
        assembly.push(`M=D`);
        break;
      case "CONSTANT":
        throw new SyntaxError(`Invalid POP to constant: ${register} ${offset}`);
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
