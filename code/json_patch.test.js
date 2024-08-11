import {json_patch} from './json_patch.js'


import {describe, test} from 'node:test'
import * as assert from 'node:assert'

describe('RFC6902 JSON Patch', () => {

test('Empty patch', () => {
  const obj = {"foo": "baz"}
  const res = json_patch([], obj)
  assert.notStrictEqual(obj, res)
  assert.deepEqual(obj, res)
})

test('RFC6902 example in 3. Document Structure', () => {
  const obj = {'a': {'b': {'c': 'foo'}}}

  const res = json_patch( [
     { "op": "test", "path": "/a/b/c", "value": "foo" },
     { "op": "remove", "path": "/a/b/c" },
     { "op": "add", "path": "/a/b/c", "value": [ "foo", "bar" ] },
     { "op": "replace", "path": "/a/b/c", "value": 42 },
     { "op": "move", "from": "/a/b/c", "path": "/a/b/d" },
     { "op": "copy", "from": "/a/b/d", "path": "/a/b/e" }
   ], obj)

  assert.notStrictEqual(obj, res)
  assert.deepEqual(res, {'a': {'b': {'d': 42, 'e': 42}}})
})

test('RFC6902 example in 4. Operations', () => {
  const obj = {'a': {'b': {}}}
  const res = {'a': {'b': {'c': 'foo'}}}
  
  assert.deepEqual(res, json_patch([{ "op": "add", "path": "/a/b/c", "value": "foo" }], obj))
  assert.deepEqual(res, json_patch([{ "path": "/a/b/c", "op": "add", "value": "foo" }], obj))
  assert.deepEqual(res, json_patch([{ "value": "foo", "path": "/a/b/c", "op": "add" }], obj))
})

describe('RFC6902 section 4.1 add', () => {
  test('add object path', () => {
    const obj = {'a': {'b': {}}}
    const ops = [{ "op": "add", "path": "/a/b/c", "value": [ "foo", "bar" ] }]
    const res = {'a': {'b': {'c': ['foo', 'bar']}}}
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('add object path replace', () => {
    const obj = {'a': {'b': {'c': 1942}}}
    const ops = [{ "op": "add", "path": "/a/b/c", "value": [ "foo", "bar" ] }]
    const res = {'a': {'b': {'c': ['foo', 'bar']}}}
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('add array path', () => {
    const obj = {'a': {'b': ['before', 'after']}}
    const ops = [{ "op": "add", "path": "/a/b/1", "value": [ "foo", "bar" ] }]
    const res = {'a': {'b': ['before', ['foo', 'bar'], 'after']}}
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('add array path end', () => {
    const obj = {'a': {'b': ['first', 'second', 'third']}}
    const ops = [{ "op": "add", "path": "/a/b/-", "value": [ "foo", "bar" ] }]
    const res = {'a': {'b': ['first', 'second', 'third', ['foo', 'bar']]}}
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('add root path', () => {
    const obj = {'a': {'b': {}}}
    const ops = [{ "op": "add", "path": "/", "value": [ "foo", "bar" ] }]
    const res = ['foo', 'bar']
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('Error for nested add path', () => {
    const obj = {'q': {'bar': 2}}
    const ops = [{ "op": "add", "path": "/a/b", "value": 'nope' }]
    assert.throws(() => json_patch(ops, obj))
  })
})

describe('RFC6902 section 4.2 remove', () => {
  test('remove object path', () => {
    const obj = {'a': {'b': {'c': ['foo', 'bar'], 'd': 1942}}}
    const ops = [{ "op": "remove", "path": "/a/b/c"}]
    const res = {'a': {'b': {'d': 1942}}}
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('remove array path', () => {
    const obj = {'a': {'b': ['before', 'after']}}
    const ops = [{ "op": "remove", "path": "/a/b/1"}]
    const res = {'a': {'b': ['before']}}
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('remove array path end', () => {
    const obj = {'a': {'b': ['first', 'second', 'third']}}
    const ops = [{ "op": "remove", "path": "/a/b/-"}]
    const res = {'a': {'b': ['first', 'second']}}
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('Error for nested remove path', () => {
    const obj = {'q': {'bar': 2}}
    const ops = [{ "op": "remove", "path": "/a/b" }]
    assert.throws(() => json_patch(ops, obj))
  })
})

describe('RFC6902 section 4.3 replace', () => {
  test('Replace example', () => {
    const obj = {'a': {'b': {'c': ['first', 'second', 'third']}}}
    const ops = [{ "op": "replace", "path": "/a/b/c", "value": 42 }]
    const res = {'a': {'b': {'c': 42}}}
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('Error for Replace example', () => {
    const obj = {'a': {'b': {}}}
    const ops = [{ "op": "replace", "path": "/a/b/c", "value": 42 }]
    assert.throws(() => json_patch(ops, obj))
  })
})

describe('RFC6902 section 4.4 move', () => {
  test('Move example', () => {
    const obj = {'a': {'b': {'c': ['first', 'second', 'third']}}}
    const ops = [{ "op": "move", "from": "/a/b/c", "path": "/a/b/d" }]
    const res = {'a': {'b': {'d': ['first', 'second', 'third']}}}
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('Error for Move example', () => {
    const obj = {'a': {'b': {'c': ['first', 'second', 'third']}}}
    const ops = [{ "op": "move", "from": "/a/b/c", "path": "/a/e/d" }]
    assert.throws(() => json_patch(ops, obj))
  })
})

describe('RFC6902 section 4.5 copy', () => {
  test('Copy example', () => {
    const obj = {'a': {'b': {'c': ['first', 'second', 'third']}}}
    const ops = [{ "op": "copy", "from": "/a/b/c", "path": "/a/b/e" }]
    const res = {'a': {'b': {'c': ['first', 'second', 'third'], 'e': ['first', 'second', 'third']}}}
    assert.deepEqual(res, json_patch(ops, obj))
    assert.notStrictEqual(res.a.b.c, res.a.b.d)
  })
  test('Error path for Copy example', () => {
    const obj = {'a': {'b': {'c': ['first', 'second', 'third']}}}
    const ops = [{ "op": "copy", "from": "/a/b/c", "path": "/a/c/e" }]
    assert.throws(() => json_patch(ops, obj))
  })
  test('Error from for Copy example', () => {
    const obj = {'a': {'b': {'c': ['first', 'second', 'third']}}}
    const ops = [{ "op": "copy", "from": "/a/b/z", "path": "/a/b/e" }]
    assert.throws(() => json_patch(ops, obj))
  })
})

describe('RFC6902 section 4.6 test', () => {
  test('Test example', () => {
    const obj = {'a': {'b': {'c': 'foo'}}}
    const ops = [{ "op": "test", "path": "/a/b/c", "value": "foo" }]
    assert.deepEqual(obj, json_patch(ops, obj))
  })

  test('Error for Test example', () => {
    const obj = {'a': {'b': {'c': ['first', 'second', 'third']}}}
    const ops = [{ "op": "test", "path": "/a/b/c", "value": "foo" }]
    assert.throws(() => json_patch(ops, obj))
  })
})

describe('RFC6902 section 5 Error Handling', () => {
  test('Error for test', () => {
    const obj = {"a": {"b": {"c": 1942}}}
    const ops = [
      { "op": "replace", "path": "/a/b/c", "value": 42 },
      { "op": "test", "path": "/a/b/c", "value": "C" },
    ]
    assert.throws(() => json_patch(ops, obj))
  })
})

describe('RFC6902 Appendix A', () => {
  test('A.1. Adding an Object Member', () => {
    const obj = { "foo": "bar"}
    const ops = [ { "op": "add", "path": "/baz", "value": "qux" } ]
    const res = { "baz": "qux", "foo": "bar" }
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('A.2. Adding an Array Element', () => {
    const obj = { "foo": [ "bar", "baz" ] }
    const ops = [ { "op": "add", "path": "/foo/1", "value": "qux" } ]
    const res = { "foo": [ "bar", "qux", "baz" ] }
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('A.3. Removing an Object Member', () => {
    const obj = { "baz": "qux", "foo": "bar" }
    const ops = [ { "op": "remove", "path": "/baz" } ]
    const res = { "foo": "bar" }
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('A.4. Removing an Array Element', () => {
    const obj = { "foo": [ "bar", "qux", "baz" ] }
    const ops = [ { "op": "remove", "path": "/foo/1" } ]
    const res = { "foo": [ "bar", "baz" ] }
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('A.5. Replacing a Value', () => {
    const obj = { "baz": "qux", "foo": "bar" }
    const ops = [ { "op": "replace", "path": "/baz", "value": "boo" } ]
    const res = { "baz": "boo", "foo": "bar" }
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('A.6. Moving a Value', () => {
    const obj = {
      "foo": { "bar": "baz", "waldo": "fred" },
      "qux": { "corge": "grault" } }
    const ops = [ { "op": "move", "from": "/foo/waldo", "path": "/qux/thud" } ]

    const res = { "foo": { "bar": "baz" },
      "qux": { "corge": "grault", "thud": "fred" }
    }
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('A.7. Moving an Array Element', () => {
    const obj = { "foo": [ "all", "grass", "cows", "eat" ] }
    const ops = [ { "op": "move", "from": "/foo/1", "path": "/foo/3" } ]
    const res = { "foo": [ "all", "cows", "eat", "grass" ] }
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('A.8. Testing a Value: Success', () => {
    const obj = { "baz": "qux", "foo": [ "a", 2, "c" ] }
    const ops = [
      { "op": "test", "path": "/baz", "value": "qux" },
      { "op": "test", "path": "/foo/1", "value": 2 },
    ]
    assert.deepEqual(obj, json_patch(ops, obj))
  })

  test('A.9. Testing a Value: Error', () => {
    const obj = { "baz": "qux" }
    const ops = [ { "op": "test", "path": "/baz", "value": "bar" } ]
    assert.throws(() => json_patch(ops, obj))
  })

  test('A.10. Adding a Nested Member Object', () => {
    const obj = { "foo": "bar" }
    const ops = [ { "op": "add", "path": "/child", "value": { "grandchild": { } } } ]
    const res = { "foo": "bar", "child": { "grandchild": { } } }
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('A.11. Ignoring Unrecognized Elements', () => {
    const obj = { "foo": "bar" }
    const ops = [ { "op": "add", "path": "/baz", "value": "qux", "xyz": 123 } ]
    const res = { "foo": "bar", "baz": "qux" }
    assert.deepEqual(res, json_patch(ops, obj))
  })

  test('A.12. Adding to a Nonexistent Target', () => {
    const obj = { "foo": "bar" }
    const ops = [ { "op": "add", "path": "/baz/bat", "value": "qux" } ]
    assert.throws(() => json_patch(ops, obj))
  })

  test('A.13. Invalid JSON Patch Document', () => {
    const ops = [ { "op": "add", "path": "/baz", "value": "qux", "op": "remove" } ]
    assert.strictEqual(ops[0].op, 'remove')
  })

  test('A.14. ~ Escape Ordering', () => {
    const obj = { "/": 9, "~1": 10}
    const ops = [ {"op": "test", "path": "/~01", "value": 10} ]
    assert.deepEqual(obj, json_patch(ops, obj))
  })

  test('A.15. Comparing Strings and Numbers', () => {
    const obj = { "/": 9, "~1": 10 }
    const ops = [ {"op": "test", "path": "/~01", "value": "10"} ]
    assert.throws(() => json_patch(ops, obj))
  })

  test('A.16. Adding an Array Value', () => {
    const obj = { "foo": ["bar"] }
    const ops = [ { "op": "add", "path": "/foo/-", "value": ["abc", "def"] } ]
    const res = { "foo": ["bar", ["abc", "def"]] }
    assert.deepEqual(res, json_patch(ops, obj))
  })
})

})
