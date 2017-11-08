class AssertError extends Error {}

export function assert (booleanExpression: Boolean, message: string)
{
  if (!booleanExpression) {
    throw new AssertError(message)
  }
}

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

export interface profile {
  tag: string,
  start: number,
  end: number | null,
  profiles: profile[]
}

export class Profiler {
  private rootProfile: profile = {
    tag: `root`,
    start: 0,
    end: 0,
    profiles: [],
  }
  private tagStack: string[] = []
  start (tag: string) {
    const profile = this.getCurrentProfile()
    profile.profiles.push({
      tag,
      start: performance.now(),
      end: null,
      profiles: [],
    })
    this.tagStack.push(tag)
  }
  end (tag: string) {
    const lastTag = this.tagStack[this.tagStack.length - 1]
    assert(lastTag === tag, `end tag ${tag} doesn't match ${lastTag}`)
    const profile = this.getCurrentProfile()
    profile.end = performance.now()
    this.tagStack.pop()
  }
  getData () {
    return this.rootProfile.profiles
  }
  private getCurrentProfile () : profile {
    const profile: profile = this.tagStack.reduce<profile>((p, t) => {
      const profile = p.profiles.find(p => p.tag === t)!
      //TODO: improve error message
      assert(typeof profile !== "undefined", `tag "${t}" does not exist.`)
      return profile
    }, this.rootProfile)
    return profile
  }
}
