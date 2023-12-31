// Note: -1 == true, 0 == false
const fs = require("node:fs");
const path = require("node:path");
// const { parseArgs } = require("node:util");

class VMTranslator {
  constructor(file) {
    this.className = path.basename(file, ".vm");
    this.eqJMPNum = 0;
    this.gtJMPNum = 0;
    this.ltJMPNum = 0;
    this.staticNum = 0;
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
    // fs.writeFileSync(newFile, this.assembly);
    // fs.writeFileSync(path.format(assembledFile), this.assembly);
  }

  translate(ast) {
    const assembly = [];
    let functionName = "";
    for (let item of ast) {
      assembly.push(`// ${item.source}`);
      switch (item.command) {
        case "label":
          // Format: (Class.Function$Label)
          this.label(assembly, item, functionName);
          break;
        case "goto":
          this.goto(assembly, item, functionName);
          break;
        case "pop":
          this.pop(item.register, item.offset, assembly, functionName);
          break;
        case "push":
          this.push(item.register, item.offset, assembly, functionName);
          break;
        case "add":
        case "sub":
          this.addSub(assembly, item.command, functionName);
          break;
        case "and":
        case "or":
          this.andOr(assembly, item.command, functionName);
          break;
        case "not":
        case "neg":
          this.notNeg(assembly, item.command, functionName);
          break;
        case "eq":
        case "lt":
        case "gt":
          this.eqLtGt(assembly, item.command, functionName);
          break;
        default:
          break;
      }
    }
    return assembly;
  }
  label(assembly, item, functionName) {
    assembly.push(`(${item.class}.${functionName}$${item.label})`);
  }
  goto(assembly, item, functionName) {
    assembly.push(`@${item.class}.${functionName}$${item.label}`);
    assembly.push(`0;JMP`);
  }
  addSub(assembly, op, functionName) {
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
  andOr(assembly, op, functionName) {
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
  notNeg(assembly, op, functionName) {
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    if (op === "not") assembly.push(`M=!M`);
    else assembly.push(`M=-M`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  eqLtGt(assembly, op, functionName) {
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
    const eqJumpLabel = `${this.className}_JMP${this.eqJMPNum++}_${op}`;
    const endLabel = `${this.className}_END${this.eqJMPNum++}_${op}`;
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

  push(register, offset, assembly, functionName) {
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
        assembly.push(`@${this.className}.${offset}`);
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

  pop(register, offset, assembly, functionName) {
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
        assembly.push(`@${this.className}.${offset}`);
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
        case "goto":
        case "if-goto":
          {
            const [label] = rest;
            const obj = { command, label, class: this.className };
          }
          break;
        case "function":
          {
            const [name, nVars] = rest;
            const obj = { command, name, nVars: +nVars, class: this.className };
            ast.push(obj);
          }
          break;
        case "call":
          {
            const [name, nArgs] = rest;
            const obj = { command, name, nArgs: +nArgs, class: this.className };
          }
          break;
        case "return":
          {
            const obj = { command, class: this.className };
            ast.push(obj);
          }
          break;
        case "label":
          {
            const [name] = rest;
            const obj = { command, name, class: this.className };
            ast.push(obj);
          }
          break;
        case "push":
        case "pop":
          {
            let [register, offset] = rest;
            register = this.symbolMap[register.toUpperCase()];
            const obj = {
              command,
              register,
              offset: +offset,
              source: item,
              class: this.className,
            };
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
            const obj = { command, source: item, class: this.className };
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

function processInput(input, files) {
  for (let file of files) {
    const vm = new VMTranslator(input + "/" + file);

    const assembledFile = path.parse(file);
    assembledFile.ext = "asm";
    assembledFile.base = "";
    // console.log("WRITING:", path.format(assembledFile), assembledFile);
    const newFile = file.replace(/\.vm$/, ".asm");
    // fs.appendFileSync(newFile, )
    console.log("ASSEMBLING FILE:", file, vm.assembly);
  }
}

const inputFile = process.argv[2];
let isDir = fs.existsSync(inputFile) && fs.lstatSync(inputFile).isDirectory();
let files = [];
if (isDir) {
  files = fs.readdirSync(inputFile).filter((e) => /\.vm$/.test(e));
} else {
  files.push(inputFile);
}
console.log("input is:", files);

if (files.length > 0) {
  // const vm = new VMTranslator(inputFile);
  processInput(inputFile, files);
} else {
  console.error(
    "Must supply either directory containing vm files or a vm file."
  );
  process.exit(1);
}
