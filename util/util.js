const log = (str) => console.log(str);
const debugLog = (p) => (process.env.NODE_ENV === 'development' ? console.log(p) : false);
const strError = (e, hint) =>
  `Error : ${hint} : ${e.message}\n${e.stack.split('\n').slice(1, 3).join('\n')}`;
const dir = (p) => console.dir(p, { depth: 10 });

export { log, debugLog, dir, strError };
