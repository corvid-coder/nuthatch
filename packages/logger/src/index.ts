export default class Logger {
  debug (...messages : Array<String>) {
    console.debug.apply(this, messages)
  }
  info (...messages : Array<String>) {
    console.info.apply(this, messages)
  }
  warn (...messages : Array<String>) {
    console.warn.apply(this, messages)
  }
  error (...messages : Array<String>) {
    console.error.apply(this, messages)
  }
}