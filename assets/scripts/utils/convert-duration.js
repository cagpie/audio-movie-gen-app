export default function (duration) {
  const mm = `${ Math.floor(duration / 60) }`.slice(-2)
  const ss = `0${ duration % 60 }`.slice(-2)
  return `${ mm }:${ ss }`
}