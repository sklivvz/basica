const TAB = `\t`;
import * as fs from 'fs';
let Look;              /* Lookahead Character */

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
  console.debug("IsAlpha", x, x >= 'A' && x <= 'Z')
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
  let Factor;
  if (Look === '(') {
    Match('(');
    Factor = Expression();
    Match(')');
  } else {
    Factor = GetNum();
  }
  return Factor;
}
/*--------------------------------------------------------------*/
/* Recognize and Translate a Multiply */
function Multiply() {
  Match('*');
  Factor();
  EmitLn('MULS (SP)+,D0');
}
/*--------------------------------------------------------------*/
/* Recognize and Translate a Divide */
function Divide() {
  Match('/');
  Factor();
  EmitLn('MOVE (SP)+,D1');
  EmitLn('DIVS D1,D0');
}
/*--------------------------------------------------------------*/
/* Parse and Translate a Math Term */
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
/* Output a String with Tab and CRLF */
function EmitLn(s) {
  Emit(s);
  fs.writeSync(process.stdout.fd, `\n`);
}
/*--------------------------------------------------------------*/
/* Recognize and Translate a Add */
function Add() {
  Match('+');
  Term();
  EmitLn('ADD (SP)+,D0');
}
/*--------------------------------------------------------------*/
/* Recognize and Translate a Subtract */
function Subtract() {
  Match('-');
  Term();
  EmitLn('SUB (SP)+,D0');
  EmitLn('NEG D0');
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
  GetChar();
}
