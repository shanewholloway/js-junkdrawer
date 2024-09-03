import {json_equal} from './json_equal.js'

import {describe, test} from 'node:test'
import * as assert from 'node:assert'


describe('json_equal tests', () => {
  test('null, null', () =>
    assert.strictEqual(json_equal(null, null), true))
  test('undefined, undefined', () =>
    assert.strictEqual(json_equal(undefined, undefined), true))
  test('null, undefined', () =>
    assert.strictEqual(json_equal(null, undefined), false))

  test('null, 42', () =>
    assert.strictEqual(json_equal(null, 42), false))
  test('null, 19.42', () =>
    assert.strictEqual(json_equal(null, 19.42), false))
  test('null, "string"', () =>
    assert.strictEqual(json_equal(null, "string"), false))

  test('42, 42', () =>
    assert.strictEqual(json_equal(42, 42), true))
  test('42, 1842', () =>
    assert.strictEqual(json_equal(42, 1842), false))
  test('42, 19.42', () =>
    assert.strictEqual(json_equal(42, 19.42), false))
  test('19.42, 19.42', () =>
    assert.strictEqual(json_equal(19.42, 19.42), true))

  test('true, true', () =>
    assert.strictEqual(json_equal(true, true), true))
  test('false, false', () =>
    assert.strictEqual(json_equal(false, false), true))
  test('false, true', () =>
    assert.strictEqual(json_equal(false, true), false))
  test('true, false', () =>
    assert.strictEqual(json_equal(true, false), false))

  test('"string", "string"', () =>
    assert.strictEqual(json_equal("string", "string"), true))
  test('"string", "other"', () =>
    assert.strictEqual(json_equal("string", "other"), false))

  describe('arrays', () => {
    test('[] equal []', () =>
      assert.strictEqual( json_equal( [], [] ), true))

    test('[NaN] not equal [NaN]', () =>
      assert.strictEqual( json_equal( [NaN], [NaN] ), false))

    test('["a",true,42,null,-5] equal', () =>
      assert.strictEqual( json_equal(
          ["a",true,42,null,-5], 
          ["a",true,42,null,-5],
        ), true))

    test('["a",true,42,null,-5] different last value', () =>
      assert.strictEqual( json_equal(
          ["a",true,42,null,-5], 
          ["a",true,42,null,15], 
        ), false))

    test('["a",true,42,null,-5] different length', () =>
      assert.strictEqual( json_equal(
          ["a",true,42,null,-5], 
          ["b",true,1942,null,-5, {}],
        ), false))

    test('nested [["a",true],42,[null,-5]] equal', () =>
      assert.strictEqual( json_equal(
          [["a",true],42,[null,-5]], 
          [["a",true],42,[null,-5]], 
        ), true))

    test('nested [["a",true],42,[null,-5]] different', () =>
      assert.strictEqual( json_equal(
          [["a",true],42,[null,-5]], 
          [["a",true],42,["changed",-5]], 
        ), false))
  })

  describe('objects', () => {
    test('{} equal {}', () =>
      assert.strictEqual( json_equal( {}, {} ), true))

    test('{first:[]} equal {first:[]}', () =>
      assert.strictEqual( json_equal( {first:[]}, {first:[]} ), true))

    test('{first:[]} not equal {second:[]}', () =>
      assert.strictEqual( json_equal( {first:[]}, {second:[]} ), false))
  })
})
