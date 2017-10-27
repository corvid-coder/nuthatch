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
    this.frames += 1
    this.update((now - this.lastTime) / 1000)
    this.draw()
    this.lastTime = now
    this.rafId = requestAnimationFrame(this._tick)
  }
  stop () {
    cancelAnimationFrame(this.rafId)
  }
  timeElapsed () {
    return performance.now() - this.startTime
  }
}

