export class Events {
  private reactions: {
    [key: string]: Array<(data: any) => {}>
  } = {}
  constructor () {}
  public on (
    eventType: string,
    fn: (data: any) => {},
  ) : void
  {
    if (!this.reactions[eventType]) {
      this.reactions[eventType] = []
    }
    this.reactions[eventType].push(fn)
  }
  public off (
    eventType: string,
    fn: (data: any) => {},
  ) : boolean
  {
    console.log(this.reactions[eventType])
    if (!this.reactions[eventType]) {
      return false
    }
    const index = this.reactions[eventType].indexOf(fn)
    if (index === -1) {
      return false
    }
    this.reactions[eventType].splice(index, 1)
    return true
  }
  public trigger (
    eventType: string,
    data: any,
  ) : void
  {
    if (!this.reactions[eventType]) {
      return
    }
    for (const fn of this.reactions[eventType]) {
      fn(data)
    }
  }
}