// Word boundaries as fractions of the audio, weighted by word length.
// ponytail: the TTS API returns no timestamps; length-weighting is close enough.
export function wordEnds(words: string[]) {
  const total = words.reduce((n, w) => n + w.length + 1, 0)
  let acc = 0
  return words.map((w) => (acc += (w.length + 1) / total))
}
