const fs = require("node:fs");
const path = require("node:path");

class Tokenizer {
  constructor(file) {
    this.srcName = path.basename(file, ".jack");
    this.source = this.getRawFile(file).replace(/\n\r?/g, "\n");
    console.log("source:", this.source);
    this.line = 0;
    this.cursor = 0;
    this.tokens = [];
    this.escape = { "<": "&lt;", ">": "&gt;", '"': "&quot;", "&": "&amp;" };
    this.keywords = [
      "class",
      "constructor",
      "function",
      "method",
      "field",
      "static",
      "var",
      "int",
      "char",
      "boolean",
      "void",
      "true",
      "false",
      "null",
      "this",
      "let",
      "do",
      "if",
      "else",
      "while",
      "return",
    ];
    this.parseTokens(this.source);
    this.xml = this.generateXML();
    console.log("XML:", this.xml.join("\n"));
  }
  parseTokens(source) {
    while (this.hasMoreChars()) {
      let char = this.getCurrentChar();
      let type = this.charType(char);
      // console.log("PARSING:", char, type);]

      // Process identifiers
      if (type === "CHAR") {
        let identifier = char;
        while (this.hasMoreChars()) {
          this.advance();
          char = this.getCurrentChar();
          type = this.charType(char);
          if (type !== "EOL" && (type === "CHAR" || type === "INT")) {
            identifier += char;
          } else break;
        }
        console.log("IDENTIFIER:", identifier);
        const obj = { value: identifier };
        if (this.keywords.includes(identifier)) {
          obj.type = "keyword";
        } else {
          obj.type = "identifier";
        }
        this.tokens.push(obj);
        continue;
      }

      // Process numbers
      if (type === "INT") {
        let num = char;
        this.advance();
        char = this.getCurrentChar();
        type = this.charType(char);
        while (type === "INT" && this.hasMoreChars()) {
          num += char;
          this.advance();
          char = this.getCurrentChar();
          type = this.charType(char);
        }
        console.log("NUMBER:", +num);
        const obj = { type: "integerConstant", value: +num };
        this.tokens.push(obj);
        continue;
      }

      // Process strings
      if (type === "DOUBLEQUOTE") {
        let str = "";
        this.advance();
        char = this.getCurrentChar();
        type = this.charType(char);
        while (type !== "DOUBLEQUOTE" && this.hasMoreChars()) {
          str += char;
          this.advance();
          char = this.getCurrentChar();
          type = this.charType(char);
        }
        console.log("STRING:", "|" + str + "|");
        this.advance();
        const obj = { type: "stringConstant", value: str };
        this.tokens.push(obj);
        continue;
      }

      // Process symbols
      if (type === "SYMBOL") {
        let lookAhead = this.peek();
        if (char === "/" && (lookAhead === "/" || lookAhead === "*")) {
          // console.log("found slash:::::::", char, lookAhead);
          if (lookAhead === "/") {
            // Single line comment, skip everything to the end of the line
            while (type !== "EOL" && this.hasMoreChars()) {
              this.advance();
              char = this.getCurrentChar();
              type = this.charType(char);
              // console.log("CHAR:", char, type, char.charCodeAt(0));
            }
          } else if (lookAhead === "*") {
            // Multi line comment, skip everything to the end of the comment (*/)
            while (
              !(char === "*" && this.peek() === "/") &&
              this.hasMoreChars()
            ) {
              this.advance();
              char = this.getCurrentChar();
              type = this.charType(char);
              // console.log("char:", char);
            }
            if (char === "*" && this.peek() === "/") {
              this.advance();
              char = this.getCurrentChar();
              type = this.charType(char);
              console.log("skipping1...", char, this.peek());
              this.advance();
            }
          }
        } else {
          // Process as regular symbol
          console.log("SYMBOL:", char);
          const obj = { type: "symbol", value: char };
          if (char in this.escape) obj.value = this.escape[char];
          this.tokens.push(obj);
          this.advance();
        }
        continue;
      }
      if (type === "WHITESPACE" || type === "EOL") {
        this.advance();
        continue;
      }
      if (type === "UNKNOWN") {
        throw new SyntaxError(
          `Syntax error at char: ${char} - ${char.charCodeAt(0)} - ${
            this.cursor
          }`
        );
      }
      // this.advance();
    }
  }
  getCurrentChar() {
    return this.source[this.cursor];
  }
  advance() {
    if (this.cursor < this.source.length) {
      this.cursor++;
    }
  }
  hasMoreChars() {
    return this.cursor < this.source.length;
  }
  peek() {
    if (this.hasMoreChars()) return this.source[this.cursor + 1];
    return null;
  }
  charType(char) {
    if (/[a-z_]/i.test(char)) return "CHAR";
    if (/[0-9]/.test(char)) return "INT";
    // { } [ ] ( ) . , ; + - * / & | < > = ~
    if (/[{}\[\]().,;+\-*\/&|<>=~]/.test(char)) return "SYMBOL";
    if (char === '"') return "DOUBLEQUOTE";
    if (/[ \t]/.test(char)) return "WHITESPACE";
    if (/[\n\r]/.test(char)) return "EOL";
    return "UNKNOWN";
  }
  generateXML() {
    const xml = ["<tokens>"];
    for (let token of this.tokens) {
      xml.push(`<${token.type}> ${token.value} </${token.type}>`);
    }
    xml.push("</tokens>");
    return xml;
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
    const analyzer = new Tokenizer(file);
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
