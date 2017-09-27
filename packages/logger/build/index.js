export default class Logger {
    debug(...messages) {
        console.debug.apply(this, messages);
    }
    info(...messages) {
        console.info.apply(this, messages);
    }
    warn(...messages) {
        console.warn.apply(this, messages);
    }
    error(...messages) {
        console.error.apply(this, messages);
    }
}
//# sourceMappingURL=index.js.map