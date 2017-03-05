const isShortFlag = v => /^-[^-]/.test(v)
const isLongFlag = v => /^--.+/.test(v)
const isFlag = v => isShortFlag(v) || isLongFlag(v)
const isPositional = v => !isFlag(v)

const reduce = (fn, initial, array) => {
  let acc = [initial, array]
  while (acc[1] && acc[1].length > 0) {
    acc = fn(acc[0], acc[1])
  }
  return acc[0]
}

const stripHyphens = flag => flag.replace(/^--?/, '')

// '-cats' -> ['-c', '-a', '-t', '-s']
// '-c     -> ['-c']
const splitShortFlags = flag => stripHyphens(flag).split('').map(v => '-' + v)

const splitFlags = flag => {
  const flags = isShortFlag(flag) ? splitShortFlags(flag) : [ flag ]
  return [ flags.slice(0, -1), flags.pop() ]
}

// '--foo=bar' -> ['--foo', 'bar']
// '--foo'     -> ['--foo']
const findValueInFlag = flag => {
  const [ key, ...rest ] = flag.split('=')
  return rest.length ? [ key, rest.join('=') ] : [ key ]
}

const prepare = (options, result) => {
  const keys = ['opts', options.stopEarly ? 'rest' : 'pos']
  options['--'] && keys.push('--')
  return keys.reduce((acc, v) => {
    acc[v] = result[v] || []
    return acc
  }, {})
}

const parse = (args, options = {}) => {
  const isFlagOnly = chunk => options.flagOnly && options.flagOnly.includes(chunk)
  const isEndMarker = v => options['--'] && v === '--'
  const shouldNotUseValue = (lastFlag, tail) => (
    isFlagOnly(lastFlag) ||
    tail.length === 0 ||
    isFlag(tail[0]) ||
    isEndMarker(tail[0])
  )

  const result = reduce(({ opts, pos }, remaining) => {
    const [ head, ...tail ] = remaining

    if (isEndMarker(head)) {
      return [ { opts, pos, '--': tail } ]
    } else if (isPositional(head)) {
      if (options.stopEarly) {
        return [ { opts, rest: [ head, ...tail ] } ]
      } else {
        return [
          { opts, pos: [ ...pos, head ] },
          tail
        ]
      }
    } else {
      const [ flag, flagValue ] = findValueInFlag(head)
      const [ justFlags, lastFlag ] = splitFlags(flag)
      const optsWithFlags = [ ...opts, ...justFlags ]
      if (flagValue !== undefined && !isFlagOnly(lastFlag)) {
        return [
          { opts: [...optsWithFlags, [ lastFlag, flagValue ] ], pos },
          tail
        ]
      } else if (shouldNotUseValue(lastFlag, tail)) {
        return [
          { opts: [ ...optsWithFlags, lastFlag ], pos },
          tail
        ]
      } else {
        const [ value, ...newTail ] = tail
        return [
          { opts: [ ...optsWithFlags, [ lastFlag, value ] ], pos },
          newTail
        ]
      }
    }
  }, { opts: [], pos: [], rest: [], '--': [] }, args)

  return prepare(options, result)
}

module.exports = parse
