export interface Sound {
  url: string,
  data: AudioBuffer,
}

export class Audio {
  private context: AudioContext
  private gainNode: GainNode;
  constructor () {
    this.context = new AudioContext()
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
  }
  public load (url: string) : Promise<Sound> {
    return fetch(url)
      .then(response => response.arrayBuffer())
      .then(buffer => this.context.decodeAudioData(buffer))
      .then(data => ({
        url,
        data: data,
      }))
  }
  public setVolume (gain: number) {
    this.gainNode.gain.value = gain * gain;
  }
  public play (sound: Sound) : AudioBufferSourceNode {
    const source = this.context.createBufferSource()
    source.connect(this.gainNode)
    source.buffer = sound.data
    source.start(0)
    return source
  }
  public stop (audioBufferSourceNode: AudioBufferSourceNode) {
    audioBufferSourceNode.disconnect(this.context.destination)
  }
}