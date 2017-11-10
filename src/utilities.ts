export function getFile (
  filename: string
) : Promise<string> {
  return fetch(filename)
    .then((res) => res.text())
}

export function exhaustiveCheck() : never {
  throw new Error("TS Exhaustive Check")
}

export type Result<T, E extends Error> = Ok<T> | Err<E>
export enum ResultState { Ok, Err, }
export interface Ok<T> {
  state: ResultState.Ok,
  value: T
}
export function Ok<T>(value: T) : Ok<T> {
  return {
    state: ResultState.Ok,
    value,
  }
}
export interface Err<E extends Error> {
  state: ResultState.Err,
  err: E
}
export function Err<E extends Error>(err: E) : Err<E> {
  return {
    state: ResultState.Err,
    err,
  }
}


export type Option<T> = Some<T> | None
export enum OptionState { Some, None, }
export interface Some<T> {
  state: OptionState.Some,
  value: T
}
export function Some<T>(value: T) : Some<T> {
  return {
    state: OptionState.Some,
    value,
  }
}
export interface None {
  state: OptionState.None,
}
export function None () : None {
  return {
    state: OptionState.None,
  }
}
