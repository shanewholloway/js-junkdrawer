import {json_diff} from './json_diff.js'

import {describe, test} from 'node:test'
import * as assert from 'node:assert'

describe('json_diff tests', () => {
  test('null, null', () =>
    assert.deepEqual(json_diff(null, null), []))
  test('undefined, undefined', () =>
    assert.deepEqual(json_diff(undefined, undefined), []))
  test('null, undefined', () =>
    assert.deepEqual(json_diff(null, undefined, ['rocks', 'dream', 'about']),
      [{path: ['rocks', 'dream', 'about'], a:null, b:undefined}]))

  test('null, 42', () =>
    assert.deepEqual(json_diff(null, 42),
      [{path: [], a:null, b:42}]))
  test('null, 19.42', () =>
    assert.deepEqual(json_diff(null, 19.42),
      [{path: [], a:null, b:19.42}]))
  test('null, "string"', () =>
    assert.deepEqual(json_diff(null, "string"),
      [{path: [], a:null, b:"string"}]))

  test('42, 42', () =>
    assert.deepEqual(json_diff(42, 42), []))
  test('42, 1842', () =>
    assert.deepEqual(json_diff(42, 1842, ['bingo']),
      [{path: ['bingo'], a:42, b:1842}]))
  test('19.42, 19.42', () =>
    assert.deepEqual(json_diff(19.42, 19.42), []))

  test('true, true', () =>
    assert.deepEqual(json_diff(true, true), []))
  test('false, false', () =>
    assert.deepEqual(json_diff(false, false), []))
  test('false, true', () =>
    assert.deepEqual(json_diff(false, true), 
      [{path: [], a:false, b:true}]))
  test('true, false', () =>
    assert.deepEqual(json_diff(true, false), 
      [{path: [], a:true, b:false}]))

  test('"string", "string"', () =>
    assert.deepEqual(json_diff("string", "string"), []))
  test('"string", "other"', () =>
    assert.deepEqual(json_diff("string", "other"),
      [{path: [], a:"string", b:"other"}]))

  describe('arrays', () => {
    test('[] equal []', () =>
      assert.deepEqual( json_diff( [], [] ), []))

    test('["a",true,42,null,-5] equal', () =>
      assert.deepEqual( json_diff(
          ["a",true,42,null,-5], 
          ["a",true,42,null,-5],
        ), []))

    test('["a",true,42,null,-5] different last value', () =>
      assert.deepEqual( json_diff(
          ["a",true,42,null,-5], 
          ["a",true,42,null,15], 
        ), [
          {path: [4], a: -5, b: 15},
        ]))

    test('["a",true,42,null,-5] different length', () =>
      assert.deepEqual( json_diff(
          ["a",true,42,null,-5], 
          ["b",true,1942,null,-5, {}],
        ), [
          {path: [0], a: "a", b: "b"},
          {path: [2], a: 42, b: 1942},
          {path: [5], b: {}},
        ]))

    test('nested [["a",true],42,[null,-5]] equal', () =>
      assert.deepEqual( json_diff(
          [["a",true],42,[null,-5]], 
          [["a",true],42,[null,-5]], 
        ), []))

    test('nested [["a",true],42,[null,-5]] different', () =>
      assert.deepEqual( json_diff(
          [["a",true],42,[null,-5]], 
          [["a",true],42,["changed",-5]], 
        ), [
          {path: [2,0], a: null, b: 'changed'},
        ]))
  })

  describe('objects', () => {
    test('{} equal {}', () =>
      assert.deepEqual( json_diff( {}, {} ), []))

    test('{first:[]} equal {first:[]}', () =>
      assert.deepEqual( json_diff( {first:[]}, {first:[]} ), []))

    test('{first:[]} not equal {second:[]}', () =>
      assert.deepEqual(
        json_diff(
          {first:[], stable: ['a','b','c'], third: {val: 42}},
          {second:[], stable: ['a','b','c'], third: {val: 1942}},
        ), [
          {path: ['third', 'val'], a: 42, b: 1942},
          {path: ['second'], b: []},
          {path: ['first'], a: []},
        ]))
  })
})
