const test = require('tape')
const parse = require('./')

;[
  [
    'basic "--arg value" pairs',
    ['--foo', 'bar', '--baz', 'qux'],
    {opts: [['--foo', 'bar'], ['--baz', 'qux']], pos: []}
  ],
  [
    'basic "-a value" pairs',
    ['-f', 'bar', '-b', 'qux'],
    {opts: [['-f', 'bar'], ['-b', 'qux']], pos: []}
  ],
  [
    'basic "--arg=value" options',
    ['--foo=bar', '--baz=qux'],
    {opts: [['--foo', 'bar'], ['--baz', 'qux']], pos: []}
  ],
  [
    'basic "-a=value" options',
    ['-f=bar', '-b=qux'],
    {opts: [['-f', 'bar'], ['-b', 'qux']], pos: []}
  ],
  [
    '"-abc=value" options',
    ['-wow=dud', 'foo'],
    {opts: ['-w', '-o', ['-w', 'dud']], pos: ['foo']}
  ],
  [
    'all positional',
    ['foo', 'bar', 'baz'],
    {opts: [], pos: ['foo', 'bar', 'baz']}
  ],
  [
    'pairs and positional',
    ['-a', 'aa', 'foo', 'bar', '--bar', 'bb', 'baz', '--c=d', 'qux'],
    {
      opts: [['-a', 'aa'], ['--bar', 'bb'], ['--c', 'd']],
      pos: ['foo', 'bar', 'baz', 'qux']
    }
  ],
  [
    'simple combined short flags',
    ['-cats', '-dogs'],
    {opts: ['-c', '-a', '-t', '-s', '-d', '-o', '-g', '-s'], pos: []}
  ],
  [
    'options.stopEarly options stops at first positional arg',
    [['-ab', '--foo', '--bar=baz', 'qux'], {stopEarly: true}],
    {opts: ['-a', '-b', '--foo', ['--bar', 'baz']], rest: ['qux']}
  ],
  [
    'options.stopEarly test with more stuff',
    [['-ab', '--foo', '--bar=baz', 'qux', '--hey', '--sup'], {stopEarly: true}],
    {opts: ['-a', '-b', '--foo', ['--bar', 'baz']], rest: ['qux', '--hey', '--sup']}
  ],
  [
    'options.flagOnly',
    [['-ab', '--foo', 'bar', '--cat', 'dog', '--bar=baz', '-a', 'qux'], {flagOnly: ['-a', '--foo']}],
    {
      opts: ['-a', '-b', '--foo', ['--cat', 'dog'], ['--bar', 'baz'], '-a'],
      pos: ['bar', 'qux']
    }
  ],
  [
    '"--arg=value" when "--arg" is flagOnly, value is ignored',
    [['--arg=value', 'foo', '-a=b'], {flagOnly: ['--arg', '-a']}],
    {opts: ['--arg', '-a'], pos: ['foo']}
  ],
  [
    'treats - as a value',
    ['-bar', '-', '-c'],
    {opts: ['-b', '-a', ['-r', '-'], '-c'], pos: []}
  ],
  [
    'treats -- as a value by default',
    ['-a', '--bar', '--', '-c', 'def'],
    {opts: ['-a', ['--bar', '--'], ['-c', 'def']], pos: []}
  ],
  [
    `"options['--']" stops on -- and collects what follows`,
    [['-a', '--bar', '--', '-c', 'def'], {'--': true}],
    {opts: ['-a', '--bar'], pos: [], '--': ['-c', 'def']}
  ],
  [
    'stopEarly and --',
    [['-c', 'at', '--', 'moar'], {stopEarly: true, '--': true}],
    {opts: [['-c', 'at']], rest: [], '--': ['moar']}
  ],
  [
    'stopEarly and --',
    [['-c', 'at', 'stop', '--', 'moar'], {stopEarly: true, '--': true}],
    {opts: [['-c', 'at']], rest: ['stop', '--', 'moar'], '--': []}
  ],
  [
    'line breaks',
    ['--foo=bar\nb az', '-x', 'a\nb'],
    {opts: [['--foo', 'bar\nb az'], ['-x', 'a\nb']], pos: []}
  ]
].forEach(([name, args, expected, only]) => {
  const tFn = only ? test.only : test
  args = Array.isArray(args[0]) ? args : [args]
  tFn(`${name} | ${args[0].join(' ')}`, t => {
    t.deepEqual(parse(...args), expected)
    t.end()
  })
})
