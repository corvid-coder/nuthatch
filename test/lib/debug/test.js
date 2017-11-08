import { Logger, assert, Profiler } from "/lib/debug.js"

const logger = new Logger()

logger.info("Enable verbose log output in Chrome Developer Tools")
logger.debug("debug")
logger.info("info")
logger.warn("warn")
logger.error("error")

assert(1+1 === 2, "This shouldn't be an AssertError")
try {
  assert(1+1 === 3, "This should be an AssertError")
} catch (e) {
  logger.error(e)
}
try {
  assert(1+1 === 3)
} catch (e) {
  logger.error(e)
}

const profiler = new Profiler()

profiler.start("graphics")
profiler.start("updateSprite")
logger.debug("Make sure you wait 6 seconds for test to complete.")
setTimeout(() => profiler.end("updateSprite"), 1000)
setTimeout(() => profiler.end("graphics"), 5000)
setTimeout(() => logger.debug(profiler.getData()), 6000)