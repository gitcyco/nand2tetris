// Note: -1 == true, 0 == false
const fs = require("node:fs");
const path = require("node:path");
// const { parseArgs } = require("node:util");

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
      CONSTANT: "CONSTANT",
      STATIC: "STATIC",
      POINTER: "POINTER",
    };
    this.rawFile = this.getRawFile(file);
    console.log(`${file}::\n${this.rawFile}`);
    this.ast = this.processCommands(this.stripInput(this.rawFile));
    this.assembly = this.translate(this.ast).join("\n");
    // console.log("AST:", this.ast);
    // console.log("ASSEMBLY:", this.assembly);
    const assembledFile = path.parse(file);
    assembledFile.ext = "asm";
    assembledFile.base = "";
    // console.log("WRITING:", path.format(assembledFile), assembledFile);
    const newFile = file.replace(/\.vm$/, ".asm");
    fs.writeFileSync(newFile, this.assembly);
    // fs.writeFileSync(path.format(assembledFile), this.assembly);
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
          break;
        case "add":
        // this.add(assembly);
        // break;
        case "sub":
          // this.sub(assembly);
          this.addSub(assembly, item.command);
          break;
        case "and":
        // this.and(assembly);
        // break;
        case "or":
          // this.or(assembly);
          this.andOr(assembly, item.command);
          break;
        case "not":
        // this.not(assembly);
        // break;
        case "neg":
          // this.neg(assembly);
          this.notNeg(assembly, item.command);
          break;
        case "eq":
        // this.equal(assembly);
        // break;
        case "lt":
        // this.lessThan(assembly);
        // break;
        case "gt":
          // this.greaterThan(assembly);
          this.eqLtGt(assembly, item.command);
          break;
        default:
          break;
      }
    }
    return assembly;
  }
  addSub(assembly, op) {
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`D=M`);
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    if (op === "add") assembly.push(`M=D+M`);
    else assembly.push(`M=M-D`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  andOr(assembly, op) {
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`D=M`);
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    if (op === "and") assembly.push(`M=D&M`);
    else assembly.push(`M=D|M`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  notNeg(assembly, op) {
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    if (op === "not") assembly.push(`M=!M`);
    else assembly.push(`M=-M`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  eqLtGt(assembly, op) {
    // Move y into R13
    // Move x into D
    // Move R13 into A
    // Set *SP to -1
    // Do D - A
    // Jump if (op) to JumpLabel
    // Set *SP to 0
    // JumpLabel:
    // SP + 1
    // (x === y)
    //
    let operator = "";
    if (op === "eq") operator = `D;JEQ`;
    else if (op === "lt") operator = `D;JLT`;
    else operator = `D;JGT`;
    const eqJumpLabel = `${this.rootName}_JMP${this.eqJMPNum++}_${op}`;
    const endLabel = `${this.rootName}_END${this.eqJMPNum++}_${op}`;
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

    assembly.push(`@R13`);
    assembly.push(`A=M`);
    assembly.push(`D=D-A`);
    assembly.push(`@${eqJumpLabel}`);
    assembly.push(operator);

    assembly.push(`@0`);
    assembly.push(`D=A`);
    assembly.push(`@SP`);
    assembly.push(`A=M`);
    assembly.push(`M=D`);

    assembly.push(`@${endLabel}`);
    assembly.push(`0;JMP`);

    assembly.push(`(${eqJumpLabel})`);
    assembly.push(`@0`);
    assembly.push(`D=A`);
    assembly.push(`@SP`);
    assembly.push(`A=M`);
    assembly.push(`M=D-1`);

    assembly.push(`(${endLabel})`);

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
        assembly.push(`D=M`);
        assembly.push(`@${offset}`);
        assembly.push(`D=D+A`);
        assembly.push(`@R13`);
        assembly.push(`M=D`);

        assembly.push(`@R13`);
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
        assembly.push(`@${parseInt(5 + offset)}`);
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
        assembly.push(`D=M`);
        assembly.push(`@${offset}`);
        assembly.push(`D=D+A`);
        assembly.push(`@R13`);
        assembly.push(`M=D`);
        assembly.push(`@SP`);
        assembly.push(`A=M`);
        assembly.push(`D=M`);
        assembly.push(`@R13`);
        assembly.push(`A=M`);
        assembly.push(`M=D`);
        break;
      case "STATIC":
        assembly.push(`@SP`);
        assembly.push(`M=M-1`);
        assembly.push(`A=M`);
        assembly.push(`D=M`);
        assembly.push(`@${this.rootName}.${offset}`);
        assembly.push(`M=D`);
        break;
      case "TEMP":
        assembly.push(`@SP`);
        assembly.push(`M=M-1`);
        assembly.push(`A=M`);
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
      switch (command) {
        case "label":
          break;
        case "push":
        case "pop":
          {
            let [register, offset] = rest;
            register = this.symbolMap[register.toUpperCase()];
            const obj = { command, register, offset: +offset, source: item };
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

// const args = parseArgs({
//   options: {
//     help: {
//       type: "boolean",
//       default: false,
//       short: "h",
//     },
//     output: {
//       type: "string",
//       default: "",
//       short: "o",
//     },
//   },
//   strict: false,
// });
//
// if (args.positionals.length === 0) {
//   console.error("ERROR: please provide input filename");
//   process.exit(1);
// }

// const inputFile = args.positionals[0];

const inputFile = process.argv[2];
const vm = new VMTranslator(inputFile);
