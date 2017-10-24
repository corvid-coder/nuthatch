export default class Runtime {
  private lastTime : number
  private startTime : number
  private rafId : number
  public frames : number
  private _tick : () => {}
  constructor () {
    this._tick = this.tick.bind(this)
  }
  start () {
    this.startTime = performance.now()
    this.lastTime = performance.now()
    this.frames = 0
    this._tick()
  }
  update (_dt: number) {}
  draw () {}
  tick () {
    const now = performance.now()
    this.rafId = requestAnimationFrame(this._tick)
    this.frames += 1
    try {
      this.update((now - this.lastTime) / 1000)
    } catch (e) {}
    try {
      this.draw()
    } catch (e) {}
    this.lastTime = now
  }
  stop () {
    cancelAnimationFrame(this.rafId)
  }
  timeElapsed () {
    return performance.now() - this.startTime
  }
}

