export interface State {
  destroy: () => {},
  enter: () => {},
  leave: () => {},
  update: (dt: number) => any,
  draw: () => {},
}

export class StateManager {
  private states: State[] = []
  constructor() {}
  top () : State {
    return this.states[this.states.length - 1]
  }
  update (dt: number) : any {
    return this.top().update(dt)
  }
  draw () : void {
    this.top().draw()
  }
  push(state: State) : void {
    if (this.top()) {
      this.top().leave()
    }
    this.states.push(state)
    state.enter()
  }
  pop() : State {
    const state = this.states.pop()!
    state.leave()
    state.destroy()
    if (this.top()) {
      this.top().enter()
    }
    return state
  }
}
