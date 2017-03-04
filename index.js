const isShortFlag = v => /^-[^-]/.test(v)
const isLongFlag = v => /^--/.test(v)
const isFlag = v => isShortFlag(v) || isLongFlag(v)
const isPositional = v => !isFlag(v)

const iterate = (fn, acc, args) => {
  let i = 0
  const skip = () => ++i
  const stop = () => (i = args.length)
  for (; i < args.length; ++i) {
    acc = fn(acc, args[i], args[i + 1], args.slice(i + 2), skip)
  }
  return acc
}

const stripHyphens = flag => flag.replace(/^--?/, '')

// '-cats' -> ['-c', '-a', '-t', '-s']
// '-c     -> ['-c']
const splitShortFlags = flag => stripHyphens(flag).split('').map(v => '-' + v)

const splitFlags = flag => {
  const flags = isShortFlag(flag) ? splitShortFlags(flag) : [flag]
  return [flags.slice(0, -1), flags.pop()]
}

// '--foo=bar' -> ['--foo', 'bar']
// '--foo'     -> ['--foo']
const findValueInFlag = flag => {
  const [key, ...rest] = flag.split('=')
  return rest.length ? [key, rest.join('=')] : [key]
}

const parse = (args) => {
  return iterate((acc, a, b, rest, skip, stop) => {
    if (isPositional(a)) {
      acc.pos.push(a)
    } else {
      const [justFlags, lastFlag] = splitFlags(a)
      const [flag, flagValue] = findValueInFlag(lastFlag)
      acc.opts = acc.opts.concat(justFlags)
      if (flagValue !== undefined) {
        acc.opts.push([flag, flagValue])
      } else if (isFlag(b) || b === undefined) {
        acc.opts.push(flag)
      } else {
        acc.opts.push([flag, b])
        skip()
      }
    }
    return acc
  }, {opts: [], pos: [], rest: []}, args)
}

module.exports = parse
