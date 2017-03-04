const isShortFlag = v => /^-[^-]/.test(v)
const isLongFlag = v => /^--/.test(v)
const isFlag = v => isShortFlag(v) || isLongFlag(v)
const isPositional = v => !isFlag(v)

const reduce = (ary, fn, initial) => {
  let acc = initial
  while (!acc.stop && acc.rest.length > 0) {
    acc = fn(acc)
  }
  return acc
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

const onlyTheValuesThatShouldBeReturned = ({ opts, pos, rest}) => ({ opts, pos, rest})

const parse = (args, options = {}) => {
  const isFlagOnly = chunk => options.flagOnly && options.flagOnly.includes(chunk)

  return onlyTheValuesThatShouldBeReturned(reduce(args, ({ opts, pos, rest }) => {
    const [ head, ...tail ] = rest


    if (isPositional(head)) {
      if (options.stopEarly) {
        return {
          opts,
          pos,
          rest: [ head, ...tail ],
          stop: true
        }
      } else {
        return {
          opts,
          rest: tail,
          pos: [ ...pos, head ]
        }
      }
    } else {
      const [ justFlags, lastFlag ] = splitFlags(head)
      const [ flag, flagValue ] = findValueInFlag(lastFlag)
      const optsWithFlags = [ ...opts, ...justFlags ]
      if (flagValue !== undefined) {
        return {
          pos,
          rest: tail,
          opts: [ ...optsWithFlags, [ flag, flagValue ] ]
        }
      } else if (isFlagOnly(flag) || tail.length === 0 || isFlag(tail[0])) {
        return {
          pos,
          rest: tail,
          opts: [ ...optsWithFlags, flag ]
        }
      } else {
        const [ b, ...newTail ] = tail
        return {
          pos,
          rest: newTail,
          opts: [ ...optsWithFlags, [ flag, b ] ]
        }
      }
    }
  }, { opts: [], pos: [], rest: args }))
}

module.exports = parse
