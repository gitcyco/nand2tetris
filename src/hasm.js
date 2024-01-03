const fs = require("node:fs");

// Demo file for testing
const inputFile = "./Max.asm";

init();

function init() {
  let input = getRawFile(inputFile);
  let src = stripInput(input);
  // console.log("source:", src);
  const { symbols, source } = buildSymbols(src);
  console.log("symbols:", symbols);
  console.log("source:", source);

  const processed = processCommands(source, symbols);
  console.log("Processed:", processed);
  const assembled = assemble(processed);
  console.log(assembled);
}

// comp:
// 0:   0b0101010
// 1:   0b0111111
// -1:  0b0111010
// D:   0b0001100
// A:   0b0110000
// M:   0b1110000
// !D:  0b0001101
// !A:  0b0110001
// !M:  0b1110001
// -D:  0b0001111
// -A:  0b0110011
// -M:  0b1110011
// D+1: 0b0011111
// A+1: 0b0110111
// M+1: 0b1110111
// D-1: 0b0001110
// A-1: 0b0110010
// M-1: 0b1110010
// D+A: 0b0000010
// D+M: 0b1000010
// D-A: 0b0010011
// D-M: 0b1010011
// A-D: 0b0000111
// M-D: 0b1000111
// D&A: 0b0000000
// D&M: 0b1000000
// D|A: 0b0010101
// D|M: 0b1010101

// dest  d1  d2  d3      jump  j1  j2  j3
// null  0   0   0       null  0   0   0
// M     0   0   1       JGT   0   0   1
// D     0   1   0       JEQ   0   1   0
// MD    0   1   1       JGE   0   1   1
// A     1   0   0       JLT   1   0   0
// AM    1   0   1       JNE   1   0   1
// AD    1   1   0       JLE   1   1   0
// AMD   1   1   1       JMP   1   1   1
function assemble(commands) {
  const assembled = [];
  for (let cmd of commands) {
    if (cmd.type === "A") {
      assembled.push(assembleACommand(cmd));
    } else {
      assembled.push(assembleDCommand(cmd));
    }
  }
  return assembled;
}

function assembleACommand(cmd) {
  console.log("assembling A:", cmd);
  return cmd.address.toString(2).padStart(16, "0");
}

function assembleDCommand(cmd) {
  const dest = {
    none: 0,
    M: 1,
    D: 2,
    A: 4,
  };
  const jmp = {
    none: 0,
    JGT: 1,
    JEQ: 2,
    JGE: 3,
    JLT: 4,
    JNE: 5,
    JLE: 6,
    JMP: 7,
  };
  const comp = {
    0: 0b0101010,
    1: 0b0111111,
    "-1": 0b0111010,
    D: 0b0001100,
    A: 0b0110000,
    M: 0b1110000,
    "!D": 0b0001101,
    "!A": 0b0110001,
    "!M": 0b1110001,
    "-D": 0b0001111,
    "-A": 0b0110011,
    "-M": 0b1110011,
    "D+1": 0b0011111,
    "A+1": 0b0110111,
    "M+1": 0b1110111,
    "D-1": 0b0001110,
    "A-1": 0b0110010,
    "M-1": 0b1110010,
    "D+A": 0b0000010,
    "D+M": 0b1000010,
    "D-A": 0b0010011,
    "D-M": 0b1010011,
    "A-D": 0b0000111,
    "M-D": 0b1000111,
    "D&A": 0b0000000,
    "D&M": 0b1000000,
    "D|A": 0b0010101,
    "D|M": 0b1010101,
  };
  let encoded = "111";
  let val = 0;
  if (cmd.comp in comp) {
    let bin = comp[cmd.comp];
    encoded += bin.toString(2).padStart(7, "0");
  } else throw new SyntaxError(`Invalid comp instruction: ${cmd.comp}`);
  if (cmd.dest !== "none") {
    for (let c of cmd.dest) {
      if (c in dest) {
        val += dest[c];
      } else throw new SyntaxError(`Invalid destination: ${cmd.dest}`);
    }
  }
  encoded += val.toString(2).padStart(3, "0");
  if (cmd.jmp in jmp) {
    let bin = jmp[cmd.jmp];
    encoded += bin.toString(2).padStart(3, "0");
  } else throw new SyntaxError(`Invalid jump instruction: ${cmd.jmp}`);
  return encoded;
}

function processCommands(source, symbols) {
  const output = [];
  for (let cmd of source) {
    if (/^@.*/.test(cmd)) {
      output.push(processACommand(cmd, symbols));
    } else {
      output.push(processDCommand(cmd, symbols));
    }
  }
  return output;
}

function processACommand(cmd, symbols) {
  const val = cmd.match(/(?<=@).+/)[0];
  const obj = { type: "A", address: 0, symbol: val };
  console.log("VAL:", val);
  if (/[^0-9]/gi.test(val)) {
    if (val in symbols) {
      obj.address = symbols[val];
    } else {
      symbols[val] = symbols.VAR_ADDRESS++;
      obj.address = symbols[val];
    }
  } else {
    obj.address = +val;
  }
  return obj;
}

function processDCommand(cmd, symbols) {
  const jmpKey = ["JGT", "JEQ", "JGE", "JLT", "JNE", "JLE", "JMP"];
  const obj = { type: "D", dest: "none", comp: "", jmp: "none" };
  if (cmd.includes(";")) {
    let parts = cmd.split(";");
    if (parts.length > 2)
      throw new SyntaxError(
        `Invalid D command syntax - extraneous semicolons: ${cmd}`
      );
    let jmp = parts[1];
    if (jmp !== "" && !jmpKey.includes(jmp))
      throw new SyntaxError(`Invalid jmp command: ${jmp}`);
    obj.jmp = jmp;
    cmd = cmd.replace(/;.*/, "");
  }
  if (cmd.includes("=")) {
    let parts = cmd.split("=");
    if (parts.length > 2)
      throw new SyntaxError(
        `Invalid D command syntax - invalid equality operator: ${cmd}`
      );
    let [left, right] = parts;
    obj.dest = left;
    obj.comp = right;
  } else {
    obj.comp = cmd;
  }
  return obj;
}

function buildSymbols(src) {
  // Default symbols:
  // Label RAM     hex
  // SP      0     0x0000
  // LCL     1     0x0001
  // ARG     2     0x0002
  // THIS    3     0x0003
  // THAT    4     0x0004
  // R0-R15  0-15  0x0000-f
  // SCREEN  16384 0x4000
  // KBD     24576 0x6000
  const symbols = {
    SP: 0,
    LCL: 1,
    ARG: 2,
    THIS: 3,
    THAT: 4,
    SCREEN: 16384,
    KBD: 24576,
    VAR_ADDRESS: 16,
  };

  for (let i = 0; i < 16; i++) {
    symbols[`R${i}`] = i;
  }
  let mem = 0;
  const output = [];

  for (let line of src) {
    // Check if this is a label, in the format of (xxxxxx)
    if (/^\(.*\)$/.test(line)) {
      let name = line.replace(/[()]/gi, "");
      if (name in symbols)
        throw new SyntaxError(
          `Existing label found. Duplicate label definitions are not allowed. ${line}`
        );
      symbols[name] = mem;
    } else {
      output.push(line);
      mem++;
    }
  }
  return { source: output, symbols };
}

function getRawFile(fname) {
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

function stripInput(data) {
  const lines = data.split("\n");
  const output = [];
  for (let line of lines) {
    let clean = line.replace(/\/\/.*|\s/g, "").trim();
    if (clean.length > 0) output.push(clean);
  }
  return output;
}
