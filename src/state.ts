export interface IState {
  enter: () => void,
  leave: () => void,
  update: (dt: number) => void,
  draw: () => void,
}

export class StateManager {
  private states: IState[] = []
  constructor() {}
  top () : IState {
    return this.states[this.states.length - 1]
  }
  update (dt: number) : void {
    return this.top().update(dt)
  }
  draw () : void {
    this.top().draw()
  }
  push(state: IState) : void {
    if (this.top()) {
      this.top().leave()
    }
    this.states.push(state)
    state.enter()
  }
  pop() : IState {
    const state = this.states.pop()!
    state.leave()
    if (this.top()) {
      this.top().enter()
    }
    return state
  }
}
