import { Expression, Init } from "./cradle.mjs";

Init();
console.log(Expression());

// import readline from 'readline'; // Assuming ES module support for readline
// import VM from './vm.mjs';

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
//   prompt: "💩 "
// });

// const vm = new VM("💪");

// console.log('Sklivvz BASIC Advanced Version 1.0');

// rl.prompt();

// rl.on('line', (line) => {
//   const result = vm.run(line);
//   if (result !== undefined) {
//     console.log(result);
//   } 
//   console.log("Ok");
  
//   rl.prompt();
// }).on('close', () => {
//   console.log('🚪🏃');
//   process.exit(0);
// });
