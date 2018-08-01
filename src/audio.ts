export interface Sound {
  url: string,
  buffer: AudioBuffer,
}

export class Audio {
  private context: AudioContext
  constructor () {
    this.context = new AudioContext()
  }
  public async load (url: string) : Promise<Sound> {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    return {
      url,
      buffer: await this.context.decodeAudioData(buffer),
    }
  }
  public play (sound: Sound) : AudioBufferSourceNode {
    const source = this.context.createBufferSource()
    source.connect(this.context.destination)
    source.buffer = sound.buffer
    source.start(0)
    return source
  }
}