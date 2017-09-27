export default class Logger {
    debug(...messages: Array<String>): void;
    info(...messages: Array<String>): void;
    warn(...messages: Array<String>): void;
    error(...messages: Array<String>): void;
}
