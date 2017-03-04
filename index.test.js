const test = require('tape')
const parse = require('./')

;[
  [
    'basic "--arg value" pairs',
    ['--foo', 'bar', '--baz', 'qux'],
    {opts: [['--foo', 'bar'], ['--baz', 'qux']], pos: [], rest: []}
  ],
  [
    'basic "-a value" pairs',
    ['-f', 'bar', '-b', 'qux'],
    {opts: [['-f', 'bar'], ['-b', 'qux']], pos: [], rest: []}
  ],
  [
    'basic "--arg=value" options',
    ['--foo=bar', '--baz=qux'],
    {opts: [['--foo', 'bar'], ['--baz', 'qux']], pos: [], rest: []}
  ],
  [
    'all positional',
    ['foo', 'bar', 'baz'],
    {opts: [], pos: ['foo', 'bar', 'baz'],  rest: []}
  ],
  [
    'pairs and positional',
    ['-a', 'aa', 'foo', 'bar', '--bar', 'bb', 'baz', '--c=d', 'qux'],
    {
      opts: [['-a', 'aa'], ['--bar', 'bb'], ['--c', 'd']],
      pos: ['foo', 'bar', 'baz', 'qux'],
      rest: []
    }
  ],
  [
    'simple combined short flags',
    ['-cats', '-dogs'],
    {opts: ['-c', '-a', '-t', '-s', '-d', '-o', '-g', '-s'], pos: [], rest: []}
  ],
  [
    'stopEarly options stops at first positional arg',
    [['-ab', '--foo', '--bar=baz', 'qux'], {stopEarly: true}],
    {opts: ['-a', '-b', '--foo', ['--bar', 'baz']], pos: [], rest: ['qux']}
  ],
  [
    'stopEarly test with more stuff',
    [['-ab', '--foo', '--bar=baz', 'qux', '--hey', '--sup'], {stopEarly: true}],
    {opts: ['-a', '-b', '--foo', ['--bar', 'baz']], pos: [], rest: ['qux', '--hey', '--sup']}
  ]
].forEach(([name, args, expected, only]) => {
  const tFn = only ? test.only : test
  args = Array.isArray(args[0]) ? args : [args]
  tFn(`${name} | ${args[0].join(' ')}`, t => {
    t.deepEqual(parse(...args), expected)
    t.end()
  })
})
