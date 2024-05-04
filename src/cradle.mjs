const TAB = `\t`;
const CR = '\r'; // Carriage Return
const LF = '\n'; // Line Feed

const Table = {};

import * as fs from 'fs';
export let Look;              /* Lookahead Character */

/*---------------------------------------------------------------*/
/* Initialize the Variable Area */
function InitTable() {
  let i;
  for (i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
      Table[String.fromCharCode(i)] = 0;
  }
}
/*--------------------------------------------------------------*/
/* Read New Character From Input Stream */
function GetChar() {
  const buffer = Buffer.alloc(1);
  fs.readSync(0, buffer, 0, 1);
  Look = buffer.toString('utf8');
  return Look;
}
/*--------------------------------------------------------------*/
/* Report an Error */
function Error(s) {
  console.error(`\nError: ${s}.`);
}
/*--------------------------------------------------------------*/
/* Report Error and Halt */
function Abort(s) {
  Error(s);
  process.exit(0)
}
/*--------------------------------------------------------------*/
/* Report What Was Expected */
function Expected(s) {
  Abort(`${s} Expected`);
}
/*--------------------------------------------------------------*/
/* Match a Specific Input Character */
function Match(x) {
  if (Look === x)
    GetChar();
  else
    Expected(`'${x}'`);
}
/*--------------------------------------------------------------*/
/* Recognize an Alpha Character */
function IsAlpha(c) {
  let x = `${c}`.toUpperCase();
  return x >= 'A' && x <= 'Z';
}
/*--------------------------------------------------------------*/
/* Recognize a Decimal Digit */
function IsDigit(c) {
  return c >= '0' && c <= '9';
}
/*--------------------------------------------------------------*/
/* Recognize an Addop */
function IsAddop(c) {
  return ['+', '-'].includes(c);
}
/*--------------------------------------------------------------*/
/* Get an Identifier */
function GetName() {
  if (!IsAlpha(Look))
    Expected('Name');
  const result = `${Look}`.toUpperCase();
  GetChar();
  return result;
}
/*--------------------------------------------------------------*/
/* Get a Number */
function GetNum() {
  if (!IsDigit(Look))
    Expected('Integer');
  const result = parseInt(Look);
  GetChar();
  return result;
}
/*--------------------------------------------------------------*/
/* Output a String with Tab */
function Emit(s) {
  fs.writeSync(process.stdout.fd, `${TAB}${s}`);
}
/*--------------------------------------------------------------*/
/* Parse and Translate an Identifier */
function Ident() {
  const name = GetName();
  if (Look === '(') {
    Match('(');
    Match(')');
    EmitLn(`BSR ${name}`);
  } else {
    EmitLn(`MOVE ${name}(PC),D0`);
  }
}
/*--------------------------------------------------------------*/
/* Parse and Translate a Math Factor */
function Factor() {
  let result;
  if (Look === '(') {
      Match('(');
      result = Expression();
      Match(')');
  } else if (IsAlpha(Look)) {
      result = Table[GetName()];
  } else {
      result = GetNum();
  }
  return result;
}
function Term() {
  let Value = Factor();
  while (['*', '/'].includes(Look)) {
    switch (Look) {
      case '*':
        Match('*');
        Value *= Factor();
        break;
      case '/':
        Match('/');
        Value = Math.floor(Value / Factor());
        break;
    }
  }
  return Value;
}

/*--------------------------------------------------------------*/
/* Parse and Translate an Assignment Statement */

export function Assignment() {
  let Name = GetName();
  Match('=');
  Table[Name] = Expression();
  console.log(Table)
}

/*--------------------------------------------------------------*/
/* Recognize and Skip Over a Newline */

export function NewLine() {
  if (Look === CR) {
      GetChar();
  }
  if (Look === LF) {
      GetChar();
      console.log(2)
  }
}
/*--------------------------------------------------------------*/


/*--------------------------------------------------------------*/
/* Output a String with Tab and CRLF */
function EmitLn(s) {
  Emit(s);
  fs.writeSync(process.stdout.fd, `\n`);
}

export function Expression() {
  let Value;
  if (IsAddop(Look))
    Value = 0;
  else
    Value = Term();
  while (IsAddop(Look)) {
    switch (Look) {
      case '+':
        Match('+');
        Value += Term();
        break;
      case '-':
        Match('-');
        Value -= Term();
        break;
    }
  }
  return Value;
}

/*--------------------------------------------------------------*/
/* Initialize */
export function Init() {
  InitTable();
  GetChar();
}
