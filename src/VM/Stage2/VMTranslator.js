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
    this.returnNum = 0;
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
    // const newFile = file.replace(/\.vm$/, ".asm");
    // fs.writeFileSync(newFile, this.assembly);
    // fs.writeFileSync(path.format(assembledFile), this.assembly);
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
            const obj = { command, label, source: item, class: this.className };
            ast.push(obj);
          }
          break;
        case "function":
          {
            const [name, nVars] = rest;
            const obj = {
              command,
              name,
              source: item,
              nVars: +nVars,
              class: this.className,
            };
            ast.push(obj);
          }
          break;
        case "call":
          {
            const [name, nArgs] = rest;
            const obj = {
              command,
              name,
              source: item,
              nArgs: +nArgs,
              class: this.className,
            };
            ast.push(obj);
          }
          break;
        case "return":
          {
            const obj = { command, source: item, class: this.className };
            ast.push(obj);
          }
          break;
        case "label":
          {
            const [name] = rest;
            const obj = { command, name, source: item, class: this.className };
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
          process.exit(1);
          break;
      }
    }
    return ast;
  }
  translate(ast) {
    const assembly = [];
    let functionName = "";
    let returnNum = 0;
    for (let item of ast) {
      // assembly.push(`\n// ${item.source}`);

      switch (item.command) {
        case "return":
          this.returnDef(assembly, item);
          break;
        case "call":
          this.callDef(assembly, item, returnNum++);
          break;
        case "function":
          functionName = item.name;
          returnNum = 0;
          console.log("FUNCTION DEF:\n", item);
          this.functionDef(assembly, item);
          break;
        case "if-goto":
          this.ifGoto(assembly, item, functionName);
          break;
        case "label":
          this.label(assembly, item, functionName);
          break;
        case "goto":
          this.goto(assembly, item, functionName);
          break;
        case "pop":
          this.pop(item.register, item.offset, assembly, item);
          break;
        case "push":
          this.push(item.register, item.offset, assembly, item);
          break;
        case "add":
        case "sub":
          this.addSub(assembly, item.command, item);
          break;
        case "and":
        case "or":
          this.andOr(assembly, item.command, item);
          break;
        case "not":
        case "neg":
          this.notNeg(assembly, item.command, item);
          break;
        case "eq":
        case "lt":
        case "gt":
          this.eqLtGt(assembly, item.command, item);
          break;
        default:
          break;
      }
    }
    return assembly;
  }
  returnDef(assembly, item) {
    // Return procedure:
    // frame = LCL (save LCL to temp var)
    // *ARG = pop()
    // SP = ARG + 1
    // THAT = *(frame - 1)
    // THIS = *(frame - 2)
    // ARG  = *(frame - 3)
    // LCL  = *(frame - 4)
    // returnAddress = *(frame - 5)
    // goto returnAddress

    // frame = LCL (save LCL to temp var)
    assembly.push(`@LCL // ${item.source}`);
    assembly.push(`D=M`);
    assembly.push(`@R13`);
    assembly.push(`M=D`);

    // Save return address to R14
    this.returnDefFromTo(assembly, "R13", "R14", 5);

    // *ARG = pop()
    assembly.push(`@SP`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`D=M`);
    assembly.push(`@ARG`);
    assembly.push(`A=M`);
    assembly.push(`M=D`);

    // SP = ARG + 1
    assembly.push(`@ARG`);
    assembly.push(`A=M`);
    assembly.push(`D=A+1`);
    assembly.push(`@SP`);
    assembly.push(`M=D`);

    // THAT = *(frame - 1)
    this.returnDefFromTo(assembly, "R13", "THAT", 1);

    // THIS = *(frame - 2)
    this.returnDefFromTo(assembly, "R13", "THIS", 2);

    // ARG  = *(frame - 3)
    this.returnDefFromTo(assembly, "R13", "ARG", 3);

    // LCL  = *(frame - 4)
    this.returnDefFromTo(assembly, "R13", "LCL", 4);

    // returnAddress = *(frame - 5) (stored in R14)
    assembly.push(`@R14`);
    assembly.push(`A=M`);
    assembly.push(`0;JMP\n`);
  }
  functionDef(assembly, item) {
    // Function process:
    // insert (functionLabel) Format: Class.FunctionName
    // repeat nVar times: push 0 (initialized LOCAL vars segment)
    // const functionLabel = `(${item.class}.${item.name})`;
    const functionLabel = `(${item.name})`;
    assembly.push(`${functionLabel} // ${item.source}`);
    assembly.push(`@0`);
    assembly.push(`D=A`);
    for (let i = 0; i < item.nVars; i++) {
      this.pushD(assembly);
    }
  }
  callDef(assembly, item, returnNum) {
    // Call procedure:
    // push returnAddress Format: Class.FunctionName$ret.n (n == incrementing value for each function)
    // push LCL
    // push ARG
    // push THIS
    // push THAT
    // ARG = SP - 5 - nArgs
    // LCL = SP
    // goto functionLabel
    // insert (returnAddress) :: (returnAddress label generated above)
    // const returnLabel = `${item.class}.${item.name}$ret.${returnNum}`;
    const returnLabel = `${item.class}.${item.name}$ret.${returnNum}`;

    // push returnAddress
    assembly.push(`@${returnLabel} // ${item.source}`);
    assembly.push(`D=A`);
    this.pushD(assembly);

    // push LCL
    assembly.push(`@LCL`);
    assembly.push(`D=M`);
    this.pushD(assembly);

    // push ARG
    assembly.push(`@ARG`);
    assembly.push(`D=M`);
    this.pushD(assembly);

    // push THIS
    assembly.push(`@THIS`);
    assembly.push(`D=M`);
    this.pushD(assembly);

    // push THAT
    assembly.push(`@THAT`);
    assembly.push(`D=M`);
    this.pushD(assembly);

    // ARG = SP - 5 - nArgs
    assembly.push(`@SP`);
    assembly.push(`D=M`);
    assembly.push(`@5`);
    assembly.push(`D=D-A`);
    assembly.push(`@${item.nArgs}`);
    assembly.push(`D=D-A`);
    assembly.push(`@ARG`);
    assembly.push(`M=D`);

    // LCL = SP
    assembly.push(`@SP`);
    assembly.push(`D=M`);
    assembly.push(`@LCL`);
    assembly.push(`M=D`);

    // goto functionLabel
    // assembly.push(`@${item.class}.${item.name}`);
    assembly.push(`@${item.name}`);
    assembly.push(`0;JMP`);

    // insert (returnAddress) :: (returnAddress label generated above)
    assembly.push(`(${returnLabel})`);
  }
  ifGoto(assembly, item, functionName) {
    assembly.push(`@SP // ${item.source}`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    assembly.push(`D=M`);
    assembly.push(`@${functionName}$${item.label}`);
    assembly.push(`D;JNE`);
  }
  label(assembly, item, functionName) {
    // Format: (Class.Function$Label)
    assembly.push(`(${functionName}$${item.name}) // ${item.source}`);
  }
  goto(assembly, item, functionName) {
    assembly.push(`@${functionName}$${item.label} // ${item.source}`);
    assembly.push(`0;JMP`);
  }
  addSub(assembly, op, item) {
    assembly.push(`@SP // ${item.source}`);
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
  andOr(assembly, op, item) {
    assembly.push(`@SP // ${item.source}`);
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
  notNeg(assembly, op, item) {
    assembly.push(`@SP // ${item.source}`);
    assembly.push(`M=M-1`);
    assembly.push(`A=M`);
    if (op === "not") assembly.push(`M=!M`);
    else assembly.push(`M=-M`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
  }
  eqLtGt(assembly, op, item) {
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
    assembly.push(`@SP // ${item.source}`);
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

  push(register, offset, assembly, item) {
    switch (register) {
      case "POINTER":
        if (register === "POINTER") {
          register = offset === 0 ? "THIS" : "THAT";
        }
        assembly.push(`@${register} // ${item.source}`);
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
        assembly.push(`@${register} // ${item.source}`);
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
        assembly.push(`@${this.className}.${offset} // ${item.source}`);
        assembly.push(`D=M`);
        assembly.push(`@SP`);
        assembly.push(`A=M`);
        assembly.push(`M=D`);
        assembly.push(`@SP`);
        assembly.push(`M=M+1`);
        break;
      case "TEMP":
        assembly.push(`@${parseInt(5 + offset)} // ${item.source}`);
        assembly.push(`D=M`);
        assembly.push(`@SP`);
        assembly.push(`A=M`);
        assembly.push(`M=D`);
        assembly.push(`@SP`);
        assembly.push(`M=M+1`);
        break;
      case "CONSTANT":
        assembly.push(`@${offset} // ${item.source}`);
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

  pop(register, offset, assembly, item) {
    switch (register) {
      case "POINTER":
        register = offset === 0 ? "THIS" : "THAT";
        assembly.push(`@SP // ${item.source}`);
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
        assembly.push(`@SP // ${item.source}`);
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
        assembly.push(`@SP // ${item.source}`);
        assembly.push(`M=M-1`);
        assembly.push(`A=M`);
        assembly.push(`D=M`);
        assembly.push(`@${this.className}.${offset}`);
        assembly.push(`M=D`);
        break;
      case "TEMP":
        assembly.push(`@SP // ${item.source}`);
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
  returnDefFromTo(assembly, from, to, offset) {
    assembly.push(`@${from}`);
    assembly.push(`D=M`);
    assembly.push(`@${offset}`);
    assembly.push(`D=D-A`);
    assembly.push(`A=D`);
    assembly.push(`D=M`);
    assembly.push(`@${to}`);
    assembly.push(`M=D`);
  }
  // Push whatever is in the D register onto the stack
  pushD(assembly) {
    assembly.push(`@SP`);
    assembly.push(`A=M`);
    assembly.push(`M=D`);
    assembly.push(`@SP`);
    assembly.push(`M=M+1`);
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
  outputFileName = "";
  if (isDir(input)) {
    outputFileName = input + "/" + path.basename(input) + ".asm";
  } else {
    outputFileName = input.replace(/\.vm$/, ".asm");
  }
  console.log("OUTPUTFILENAME:", outputFileName);
  // fs.renameSync(outputFileName, outputFileName + ".bak");
  fs.writeFileSync(outputFileName, "");

  if (BOOTSTRAP) {
    const bootstrap = [];
    // bootstrap.push(`// BOOTSTRAPING SP/LCL/ARG (0/1/2) = 256/300/400`);
    // SP = 256
    bootstrap.push(`@256 // BOOTSTRAPING SP/LCL/ARG (0/1/2) = 256/300/400`);
    bootstrap.push(`D=A`);
    bootstrap.push(`@0`);
    bootstrap.push(`M=D`);

    // LCL = 300
    bootstrap.push(`@300`);
    bootstrap.push(`D=A`);
    bootstrap.push(`@1`);
    bootstrap.push(`M=D`);

    // ARG = 400
    bootstrap.push(`@400`);
    bootstrap.push(`D=A`);
    bootstrap.push(`@2`);
    bootstrap.push(`M=D`);

    // call Sys.init
    // bootstrap.push(`@Sys.init`);
    // bootstrap.push(`0;JMP\n`);

    // All of the below is not needed, commenting out for now:
    const returnLabel = `Sys.init$ret.0`;

    // bootstrap.push(`@0`);
    // bootstrap.push(`D=A`);
    // bootstrap.push(`@SP`);
    // bootstrap.push(`A=M`);
    // bootstrap.push(`M=D`);
    // bootstrap.push(`@SP`);
    // bootstrap.push(`M=M+1`);

    // push returnAddress
    bootstrap.push(`@${returnLabel}`);
    bootstrap.push(`D=A`);
    bootstrap.push(`@SP`);
    bootstrap.push(`A=M`);
    bootstrap.push(`M=D`);
    bootstrap.push(`@SP`);
    bootstrap.push(`M=M+1`);

    // push LCL
    bootstrap.push(`@LCL`);
    bootstrap.push(`D=M`);
    bootstrap.push(`@SP`);
    bootstrap.push(`A=M`);
    bootstrap.push(`M=D`);
    bootstrap.push(`@SP`);
    bootstrap.push(`M=M+1`);

    // push ARG
    bootstrap.push(`@ARG`);
    bootstrap.push(`D=M`);
    bootstrap.push(`@SP`);
    bootstrap.push(`A=M`);
    bootstrap.push(`M=D`);
    bootstrap.push(`@SP`);
    bootstrap.push(`M=M+1`);

    // push THIS
    bootstrap.push(`@THIS`);
    bootstrap.push(`D=M`);
    bootstrap.push(`@SP`);
    bootstrap.push(`A=M`);
    bootstrap.push(`M=D`);
    bootstrap.push(`@SP`);
    bootstrap.push(`M=M+1`);

    // push THAT
    bootstrap.push(`@THAT`);
    bootstrap.push(`D=M`);
    bootstrap.push(`@SP`);
    bootstrap.push(`A=M`);
    bootstrap.push(`M=D`);
    bootstrap.push(`@SP`);
    bootstrap.push(`M=M+1`);

    // ARG = SP - 5 - nArgs
    bootstrap.push(`@SP`);
    bootstrap.push(`D=M`);
    bootstrap.push(`@5`);
    bootstrap.push(`D=D-A`);
    // bootstrap.push(`@${item.nArgs}`);
    bootstrap.push(`@0`);
    bootstrap.push(`D=D-A`);
    bootstrap.push(`@ARG`);
    bootstrap.push(`M=D`);

    // LCL = SP
    bootstrap.push(`@SP`);
    bootstrap.push(`D=M`);
    bootstrap.push(`@LCL`);
    bootstrap.push(`M=D`);

    // goto functionLabel
    // assembly.push(`@${item.class}.${item.name}`);
    // bootstrap.push(`@${item.name}`);
    bootstrap.push(`@Sys.init`);
    bootstrap.push(`0;JMP`);

    // insert (returnAddress) :: (returnAddress label generated above)
    bootstrap.push(`(${returnLabel})\n`);

    fs.appendFileSync(outputFileName, bootstrap.join("\n"));
  }

  for (let file of files) {
    // const vm = new VMTranslator(input + "/" + file);
    const vm = isDir(input)
      ? new VMTranslator(input + "/" + file)
      : new VMTranslator(file);

    const assembledFile = path.parse(file);
    assembledFile.ext = "asm";
    assembledFile.base = "";
    // console.log("WRITING:", path.format(assembledFile), assembledFile);
    // const newFile = file.replace(/\.vm$/, ".asm");
    fs.appendFileSync(outputFileName, vm.assembly);
    console.log(`ASSEMBLING FILE: ${file}\nASSEMBLY:\n${vm.assembly}`);
  }
}

function isDir(input) {
  return fs.existsSync(input) && fs.lstatSync(input).isDirectory();
}

const inputFile = process.argv[2];
// let isDir = fs.existsSync(inputFile) && fs.lstatSync(inputFile).isDirectory();
let files = [];
let outputFileName = "";
let BOOTSTRAP = true;
if (isDir(inputFile)) {
  files = fs.readdirSync(inputFile).filter((e) => /\.vm$/.test(e));
} else {
  BOOTSTRAP = false;
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
