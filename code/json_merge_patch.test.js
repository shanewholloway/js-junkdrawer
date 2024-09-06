import {json_merge_patch} from './json_merge_patch.js'

import {describe, test} from 'node:test'
import * as assert from 'node:assert'

describe('JSON Merge Patch, per RFC 7396', () => {
  test('Example from section 1', () => {
    const orig = {
      "a": "b",
      "c": {
        "d": "e",
        "f": "g"
      }
    }

    const patch = {
      "a":"z",
      "c": {
        "f": null
      }
    }

    const result = {
      "a": "z",
      "c": {
        "d": "e",
      }
    }

    assert.deepEqual(json_merge_patch(orig, patch), result)
  })

  test('Example from section 3', () => {
    const orig = {
      "title": "Goodbye!",
      "author" : {
        "givenName" : "John",
        "familyName" : "Doe"
      },
      "tags":[ "example", "sample" ],
      "content": "This will be unchanged"
    }

    const patch = {
      "title": "Hello!",
      "phoneNumber": "+01-123-456-7890",
      "author": { "familyName": null },
      "tags": [ "example" ]
    }

    const result = {
      "title": "Hello!",
      "author" : { "givenName" : "John" },
      "tags": [ "example" ],
      "content": "This will be unchanged",
      "phoneNumber": "+01-123-456-7890"
    }

    assert.deepEqual(json_merge_patch(orig, patch), result)
  })

  describe('Appendix A: Example Test Cases', () => {
    test('Test Case 1', () => {
      const orig   = {"a":"b"}
      const patch  = {"a":"c"}
      const result = {"a":"c"}
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 2', () => {
      const orig   = {"a":"b"}
      const patch  = {"b":"c"}
      const result = {"a":"b","b":"c"}
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 3', () => {
      const orig   = {"a":"b"}
      const patch  = {"a":null}
      const result = {}
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 4', () => {
      const orig   = {"a":"b","b":"c"}
      const patch  = {"a":null}
      const result = {"b":"c"}
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 5', () => {
      const orig   = {"a":["b"]}
      const patch  = {"a":"c"}
      const result = {"a":"c"}
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 6', () => {
      const orig   = {"a":"c"}
      const patch  = {"a":["b"]}
      const result = {"a":["b"]}
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 7', () => {
      const orig   = {"a":{"b":"c"}}
      const patch  = {"a":{"b":"d","c":null}}
      const result = {"a":{"b":"d"}}
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 8', () => {
      const orig   = {"a":[{"b":"c"}]}
      const patch  = {"a":[1]}
      const result = {"a":[1]}
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 9', () => {
      const orig   = ["a","b"]
      const patch  = ["c","d"]
      const result = ["c","d"]
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 10', () => {
      const orig   = {"a":"b"}
      const patch  = ["c"]
      const result = ["c"]
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 11', () => {
      const orig   = {"a":"foo"}
      const patch  = null
      const result = null
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 12', () => {
      const orig   = {"a":"foo"}
      const patch  = "bar"
      const result = "bar"
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 13', () => {
      const orig   = {"e":null}
      const patch  = {"a":1}
      const result = {"e":null,"a":1}
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 14', () => {
      const orig   = [1,2]
      const patch  = {"a":"b","c":null}
      const result = {"a":"b"}
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })

    test('Test Case 15', () => {
      const orig   = {}
      const patch  = {"a":{"bb":{"ccc":null}}}
      const result = {"a":{"bb":{}}}
      assert.deepEqual(json_merge_patch(orig, patch), result)
    })
  })
})
