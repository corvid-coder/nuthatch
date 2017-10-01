export class Logger {
  debug (...messages : Array<String>) {
    console.debug.apply(null, messages)
  }
  info (...messages : Array<String>) {
    console.info.apply(null, messages)
  }
  warn (...messages : Array<String>) {
    console.warn.apply(null, messages)
  }
  error (...messages : Array<String>) {
    console.error.apply(null, messages)
  }
}

export class Profiler {
  
}
