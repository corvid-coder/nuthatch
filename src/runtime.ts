export class VariableRuntime {
  private lastTime : number = -1 
  private startTime : number = -1
  private rafId : number = -1
  public frames : number = -1
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
    this.rafId = requestAnimationFrame(this._tick)
    const now = performance.now()
    this.frames += 1
    this.update((now - this.lastTime) / 1000)
    this.draw()
    this.lastTime = now
  }
  stop () {
    cancelAnimationFrame(this.rafId)
  }
  timeElapsed () {
    return (performance.now() - this.startTime) / 1000
  }
}

export class FixedRuntime {
  private lastTime : number = -1 
  private startTime : number = -1
  private rafId : number = -1
  public frames : number = -1
  public dt: number
  private accumulator: number = 0
  private _tick : () => {}
  constructor (dt: number = 1/60) {
    this._tick = this.tick.bind(this)
    this.dt = dt
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
    this.rafId = requestAnimationFrame(this._tick)
    const now = performance.now()
    this.accumulator += (now - this.lastTime) / 1000
    this.frames += 1
    while (this.accumulator > this.dt) {
      this.update(this.dt)
      this.accumulator -= this.dt
    }
    this.draw()
    this.lastTime = now
  }
  stop () {
    cancelAnimationFrame(this.rafId)
  }
  timeElapsed () {
    return (performance.now() - this.startTime) / 1000
  }
}
