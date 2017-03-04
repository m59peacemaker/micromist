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
  ]
].forEach(([name, args, expected, only]) => {
  const tFn = only ? test.only : test
  tFn(`${name} | ${args.join(' ')}`, t => {
    t.deepEqual(parse(args), expected)
    t.end()
  })
})
