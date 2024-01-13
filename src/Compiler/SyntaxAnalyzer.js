const fs = require("node:fs");
const path = require("node:path");

class SyntaxAnalyzer {
  constructor(file) {
    this.srcName = path.basename(file, ".jack");
    this.source = this.getRawFile(file).split("\n");
    console.log("source:", this.source);
    this.line = 0;
    this.cursor = 0;
    this.tokens = {};
    this.parseTokens(this.source);
  }
  parseTokens(source) {
    for (let line of source) {
      for (let c of line) {
        console.log(this.charType(c), c);
      }
    }
  }
  getCurrentChar() {
    return this.source(this.cursor);
  }
  advance() {
    this.cursor++;
  }
  hasMoreChars() {
    return this.cursor < this.source.length;
  }
  charType(char) {
    if (/[a-z_]/i.test(char)) return "CHAR";
    if (/[0-9]/.test(char)) return "INT";
    // { } [ ] ( ) . , ; + - * / & | < > = ~
    if (/[{}\[\]().,;+\-*\/&|<>=~]/.test(char)) return "SYMBOL";
    if (char === '"') return "DOUBLEQUOTE";
    if (/\s/.test(char)) return "WHITESPACE";
    return "UNKNOWN";
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
}

function processInput(inputFile, files) {
  for (let file of files) {
    const analyzer = new SyntaxAnalyzer(file);
  }
}

function isDir(input) {
  return fs.existsSync(input) && fs.lstatSync(input).isDirectory();
}

const inputFile = process.argv[2];
let files = [];
if (isDir(inputFile)) {
  files = fs.readdirSync(inputFile).filter((e) => /\.jack$/.test(e));
} else {
  if (/\.jack$/.test(inputFile)) {
    files.push(inputFile);
  }
}

console.log("input is:", files);

if (files.length > 0) {
  processInput(inputFile, files);
} else {
  console.error(
    "Must supply either a directory containing jack source files or a jack source file."
  );
  process.exit(1);
}
