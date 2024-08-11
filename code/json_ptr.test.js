import {json_ptr, decode_ptr, encode_ptr, _json_ptr_} from './json_ptr.js'
import {json_ptr_of, json_ptr_get, json_ptr_set, json_ptr_delete, json_ptr_add, json_ptr_remove} from './json_ptr.js'

import {describe, test} from 'node:test'
import * as assert from 'node:assert'

describe('json_ptr', () => {

describe('json_ptr API', () => {
  test('decode_ptr function', () =>
    assert.strictEqual(typeof decode_ptr, 'function'))
  test('encode_ptr function', () =>
    assert.strictEqual(typeof encode_ptr, 'function'))

  test('json_ptr function', () =>
    assert.strictEqual(typeof json_ptr, 'function'))
  test('_json_ptr_ prototype', () => {
    assert.strictEqual(typeof _json_ptr_, 'object')
    assert.strictEqual(typeof _json_ptr_.bind, 'function')
    // assert.strictEqual(typeof _json_ptr_.cache, 'object')
    assert.strictEqual(typeof _json_ptr_.ptr_get, 'function')
    assert.strictEqual(typeof _json_ptr_.ptr_set, 'function')
    assert.strictEqual(typeof _json_ptr_.ptr_delete, 'function')
    assert.strictEqual(typeof _json_ptr_.ptr_of, 'function')
  })

  test('json_ptr_of function', () =>
    assert.strictEqual(typeof json_ptr_of, 'function'))
  test('json_ptr_get function', () =>
    assert.strictEqual(typeof json_ptr_get, 'function'))
  test('json_ptr_set function', () =>
    assert.strictEqual(typeof json_ptr_set, 'function'))
  test('json_ptr_delete function', () =>
    assert.strictEqual(typeof json_ptr_delete, 'function'))
  test('json_ptr_add function', () =>
    assert.strictEqual(typeof json_ptr_add, 'function'))
  test('json_ptr_remove function', () =>
    assert.strictEqual(typeof json_ptr_remove, 'function'))
})


describe('JSON Pointer parsing', () => {
  describe('Invalid JSON Pointers', () => {
    const invalid_cases = [
      'not_a_pointer',
      'nope/',
      'nope/a',
      'nope/a/b/c',
    ]

    for (let sz_ptr of invalid_cases)
      test(`Invalid decode("${sz_ptr}") throws error`, () =>
        assert.throws(() => decode_ptr(sz_ptr)))
  })

  describe('Valid JSON Pointers', () => {
    const valid_cases = [
      {ptr:'/one', path:[], key: 'one'},
      {ptr:'/9', path:[], key: 9},
      {ptr:'/one/two', path:['one'], key: 'two'},
      {ptr:'/first/7', path:['first'], key: 7},
      {ptr:'/3/end', path:[3], key: 'end'},
      {ptr:'/3/4/5', path:[3,4], key: 5},
      {ptr:'///last', path:['',''], key: 'last'},
    ]

    for (let ptr_obj of valid_cases) {
      let sz_ptr = ptr_obj.ptr

      test(`decode("${sz_ptr}")`, () =>
        assert.deepStrictEqual(decode_ptr(sz_ptr), ptr_obj))

      test(`encode("${sz_ptr}")`, () =>
        assert.strictEqual(encode_ptr(ptr_obj), sz_ptr))

      test(`decode(encode("${sz_ptr}"))`, () =>
        assert.deepStrictEqual(decode_ptr(encode_ptr(ptr_obj)), ptr_obj))

      test(`encode(decode("${sz_ptr}"))`, () =>
        assert.strictEqual(encode_ptr(decode_ptr(sz_ptr)), sz_ptr))

      test(`json_ptr("${sz_ptr}")`, () => {
        let res = json_ptr(sz_ptr)
        assert.strictEqual(res.ptr, sz_ptr)
        assert.strictEqual(res.ptr, ptr_obj.ptr)
        assert.deepStrictEqual(res.path, ptr_obj.path)
        assert.strictEqual(res.key, ptr_obj.key)

        assert.strictEqual(typeof res.ptr_get, 'function')
        assert.strictEqual(typeof res.ptr_set, 'function')
        assert.strictEqual(typeof res.ptr_delete, 'function')
        assert.strictEqual(typeof res.ptr_of, 'function')
      })

      test(`json_ptr\`${sz_ptr}\` // tempalte string`, () => {
        let res = json_ptr`${sz_ptr}`
        assert.strictEqual(res.ptr, sz_ptr)
        assert.strictEqual(res.ptr, ptr_obj.ptr)
        assert.deepStrictEqual(res.path, ptr_obj.path)
        assert.strictEqual(res.key, ptr_obj.key)

        assert.strictEqual(typeof res.ptr_get, 'function')
        assert.strictEqual(typeof res.ptr_set, 'function')
        assert.strictEqual(typeof res.ptr_delete, 'function')
        assert.strictEqual(typeof res.ptr_of, 'function')
      })
    }
  })
})


describe('json_ptr operations', () => {

  test('RFC6902 example A.1.', () => {
    let obj = {"foo": "bar"}
    json_ptr_set("/baz", obj, "qux")
    assert.deepStrictEqual(obj, {"foo": "bar", "baz": "qux"})
  })

  test('RFC6902 example A.1 using json_ptr', () => {
    let obj = {"foo": "bar"}
    let res = json_ptr('/baz').ptr_set(obj, "qux")
    assert.deepStrictEqual(obj, {"foo": "bar", "baz": "qux"})
  })

  test(`RFC6902 example A.2`, () => {
    let obj = {"foo": ["bar", "baz"]}
    let res = json_ptr_add("/foo/1", obj, "qux")
    assert.deepStrictEqual(obj, {"foo": ["bar", "qux", "baz"]})
  })

  test(`RFC6902 example A.2 using json_ptr`, () => {
    let obj = {"foo": ["bar", "baz"]}
    let res = json_ptr("/foo/1").ptr_add(obj, "qux")
    assert.deepStrictEqual(obj, {"foo": ["bar", "qux", "baz"]})
  })

  test(`RFC6902 example A.2. array assignment variation`, () => {
    let obj = {"foo": ["bar", 42, "baz"]}
    let res = json_ptr_set("/foo/1", obj, "qux")
    assert.deepStrictEqual(obj, {"foo": ["bar", "qux", "baz"]})
  })

  test(`RFC6902 example A.3`, () => {
    let obj = {"baz": "qux", "foo": "bar"}
    let res = json_ptr_delete("/baz", obj)
    assert.deepStrictEqual(obj, {"foo": "bar"})
  })

  test(`RFC6902 example A.3 using json_ptr`, () => {
    let obj = {"baz": "qux", "foo": "bar"}
    let res = json_ptr("/baz").ptr_delete(obj)
    assert.deepStrictEqual(obj, {"foo": "bar"})
  })

  test(`RFC6902 example A.4`, () => {
    let obj = {"foo": [ "bar", "qux", "baz"]}
    json_ptr_remove("/foo/1", obj)
    assert.deepStrictEqual(obj, {"foo": [ "bar", "baz"]})
  })

  test(`RFC6902 example A.4 using json_ptr`, () => {
    let obj = {"foo": [ "bar", "qux", "baz"]}
    json_ptr("/foo/1").ptr_remove(obj)
    assert.deepStrictEqual(obj, {"foo": [ "bar", "baz"]})
  })

  test(`RFC6902 example A.4 array delete variation`, () => {
    let obj = {"foo": [ "bar", "qux", "baz"]}
    json_ptr_delete("/foo/1", obj)
    assert.deepStrictEqual(obj, {"foo": [ "bar",, "baz"]})
  })

  test(`RFC6902 example A.5`, () => {
    let obj = {"baz": "qux", "foo": "bar"}
    let res = json_ptr_set("/baz", obj, "boo")
    assert.deepStrictEqual(obj, {"baz": "boo", "foo": "bar"})
  })

  test(`RFC6902 example A.6 interpretation`, () => {
    let obj = {
       "foo": { "bar": "baz", "waldo": "fred" },
       "qux": { "corge": "grault" } }

    let tgt = json_ptr_get("/foo/waldo", obj)
    json_ptr_delete("/foo/waldo", obj)
    json_ptr_set("/qux/thud", obj, tgt)

    assert.deepStrictEqual(obj, {
        "foo": { "bar": "baz" },
        "qux": { "corge": "grault", "thud": "fred" }
      })
  })

  test(`RFC6902 example A.7`, () => {
    let obj = { "foo": [ "all", "grass", "cows", "eat" ] }

    let src_ptr = json_ptr("/foo/1")
    let tgt = src_ptr.ptr_remove(obj)
    json_ptr_set("/foo/3", obj, tgt)

    assert.deepStrictEqual(obj, {
      "foo": [ "all", "cows", "eat", "grass" ] })
  })

  test(`RFC6902 example A.7 interpretation`, () => {
    let obj = { "foo": [ "all", "grass", "cows", "eat" ] }

    let tgt = json_ptr_get("/foo/1", obj)
    json_ptr_delete("/foo/1", obj)
    json_ptr_set("/foo/4", obj, tgt)

    assert.deepStrictEqual(obj, {
      "foo": [ "all", , "cows", "eat", "grass" ] })
  })

  test(`RFC6902 example A.8`, () => {
    let obj = { "baz": "qux", "foo": [ "a", 2, "c" ] }
    assert.strictEqual(json_ptr_get('/baz', obj), 'qux')
    assert.strictEqual(json_ptr_get('/foo/1', obj), 2)

    assert.deepStrictEqual(
      json_ptr_of('/foo/1', obj, true),
      [undefined, [ "a", 2, "c" ], 1] )

    assert.deepStrictEqual(
      json_ptr_of('/foo/broken', obj, true),
      ['json_ptr target invalid index', [ "a", 2, "c" ], 'broken'] )
  })

  test(`RFC6902 example A.9`, () => {
    let obj = { "baz": "qux" }
    assert.notEqual(json_ptr_get('/baz', obj), 'bar')
    assert.strictEqual(json_ptr_get('/baz', obj), 'qux')
  })

  test(`RFC6902 example A.10`, () => {
    let obj = { "foo": "bar" }
    json_ptr_set('/child', obj, { "grandchild": { } })

    assert.deepStrictEqual(obj, {
      "foo": "bar",
      "child": { "grandchild": {} },
    })

    assert.deepStrictEqual(
      json_ptr_of('/child/grandchild', obj, true),
      [undefined, { "grandchild": {} }, 'grandchild'])
  })

  test(`RFC6902 inspired A.14: Escape Ordering`, () => {
    let obj = {'/': 'slash', '~': 'tilde', '~0': 'tilde zero', '~1': 'tilde one'}

    assert.equal('tilde', json_ptr_get('/~0', obj))
    assert.equal('tilde zero', json_ptr_get('/~00', obj))
    assert.equal('tilde one', json_ptr_get('/~01', obj))
    assert.equal('slash', json_ptr_get('/~1', obj))

    json_ptr_set('/~0', obj, 'a')
    json_ptr_set('/~00', obj, 'b')
    json_ptr_set('/~01', obj, 'c')
    json_ptr_set('/~1', obj, 'd')
    assert.deepStrictEqual(obj, {
      '/': 'd', '~': 'a', '~0': 'b', '~1': 'c' })
  })

  test(`RFC6902 example A.16 interpretation`, () => {
    let obj = { "foo": [ "bar" ] }

    json_ptr_set("/foo/1", obj, ["abc", "def"])

    assert.deepStrictEqual(obj, {
      "foo": [ "bar", ["abc", "def"] ] })
  })

  test(`RFC6902 example A.16`, () => {
    let obj = { "foo": [ "bar" ] }

    json_ptr("/foo/-").ptr_add(obj, ["abc", "def"])

    assert.deepStrictEqual(obj, {
      "foo": [ "bar", ["abc", "def"] ] })
  })
})

})
