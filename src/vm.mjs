export default class VM {
  /**
   * 
   * @param {String} line 
   * @returns 
   */
  run(line) {
      return line.split('').reverse().join("");
  }
}