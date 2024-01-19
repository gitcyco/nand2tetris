const fs = require("node:fs");
const path = require("node:path");

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.tokenIndex = 0;
    this.AST = { classes: [] };
    this.classVarDecKeywords = ["static", "field"];
    this.subroutineDecKeywords = ["constructor", "function", "method"];
    this.typeKeywords = ["int", "char", "boolean"];
    console.log("parsing tokens:", this.tokens);
    this.compileClass(this.tokens);
  }
  consumeToken(value) {
    const token = this.getToken();
    if (token.value === value) {
      this.advance();
    } else {
      throw new SyntaxError(
        `Expected: ${value} but ingested invalid token: ${JSON.stringify(
          token
        )}`
      );
    }
  }
  // class: 'class' className '{' classVarDec* subRoutineDec* '}'
  compileClass() {
    this.consumeToken("class");
    const classObj = { type: "class", children: [] };
    this.AST.classes.push(classObj);
    const className = this.getToken();
    if (className.type === "identifier") {
      classObj.name = className.value;
      this.advance();
    } else {
      throw new SyntaxError(`Expected className, instead got: ${className}`);
    }
    this.consumeToken("{");
    while (this.hasMoreTokens()) {
      while (this.compileClassVarDec(classObj));
      // this.compileClassVarDec(classObj);
      // this.compileSubroutine(classObj);
      break;
    }
    console.log(JSON.stringify(this.AST));
    this.consumeToken("}");
  }
  // classVarDec: ('static'|'field') type varNAme (',' varname)* ';'
  compileClassVarDec(classObj) {
    const token = this.getToken();
    if (
      token.type === "keyword" &&
      this.classVarDecKeywords.includes(token.value)
    ) {
      const obj = { type: "classVarDec", children: [] };
      this.advance();
      const type = this.getToken();
      obj.varType = type.value;
      this.advance();
      while (this.getToken().value !== ";") {
        const varToken = this.getToken();
        console.log("varToken:", varToken);
        obj.children.push({ varName: varToken.value });
        this.advance();
        if (this.getToken().value === ",") {
          this.consumeToken(",");
        }
      }
      classObj.children.push(obj);
      this.consumeToken(";");
      return true;
    }
    return false;
  }
  // subroutineDec: ('constructor'|'function'|'method) ('void'|type) subroutineName '(' parameterList ')' subroutineBody
  compileSubroutine(classObj) {}

  // parameterList: ((type varName) (',' type varName)*)?
  compileParameterList() {}

  // subroutineBody: '{' varDec* statements '}'
  compileSubroutineBody() {}

  // varDec: 'var' type varName (',' varName)* ';'
  compileVarDec() {}

  // statements:      statement*
  // statement:       letStatement | ifStatement | whileStatement | doStatement | returnStatement
  // letStatement:    'let' varName ('[' expression ']')? '=' expression ';'
  // ifStatement:     'if' '(' expression ')' '{' statements '}' ('else' '{' statements '}')?
  // whileStatement:  'while' '(' expression ')' '{' statements '}'
  // doStatement:     'do' subroutineCall ';'
  // returnStatement: 'return' expression? ';'
  compileStatements() {}
  compileLet() {}
  compileIf() {}
  compileWhile() {}
  compileDo() {}
  compileReturn() {}
  compileExpression() {}
  compileTerm() {}
  compileExpressionList() {}
  peek() {
    if (this.tokenIndex < this.tokens.length - 1) {
      return this.tokens[this.tokenIndex + 1];
    } else return null;
  }
  getToken() {
    return this.tokens[this.tokenIndex];
  }
  advance() {
    if (this.tokenIndex < this.tokens.length) {
      this.tokenIndex++;
    }
  }
  hasMoreTokens() {
    return this.tokenIndex < this.tokens.length - 1;
  }
}

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
    const tokenizer = new Tokenizer(file);
    const parser = new Parser(tokenizer.tokens);
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
