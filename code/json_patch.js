// [RFC 6902: JavaScript Object Notation (JSON) Patch](https://datatracker.ietf.org/doc/html/rfc6902/#section-3)
import {json_ptr} from './json_ptr.js'

export function json_patch(operations, json_obj) {
  return (this || _json_patch_).patch(operations, json_obj)
}
export default json_patch


export const _json_patch_ = {
  as_op: op => structuredClone(op),
  json_ptr,

  bind(json_ptr_ = json_ptr.bind()) {
    json_patch.bind({__proto__: this, json_ptr_}) },

  patch(operations, json_obj) {
    for (let [op, res] of this.iter_patch(operations, json_obj))
      if (null === op)
        return res
  },

  *iter_patch(operations, json_obj) {
    let res = structuredClone(json_obj)
    for (let patch_op of operations) {
      patch_op = this.as_op(patch_op)
      yield [patch_op, res]

      res = this['$'+patch_op.op]?.(patch_op, res)
    }
    yield [null, res]
  },

  $add({path, value}, json_obj) {
    if ('/' === path) json_obj = value
    else this.json_ptr(path).ptr_add(json_obj, value)
    return json_obj },

  $remove({path}, json_obj) {
    this.json_ptr(path).ptr_remove(json_obj)
    return json_obj },

  $replace({path, value}, json_obj) {
    let [tgt,key] = this.json_ptr(path).ptr_of(json_obj)
    if (undefined === tgt[key])
      throw new Error('path target[key] is undefined')

    tgt[key] = value
    return json_obj },

  $move({from, path}, json_obj) {
    let value = this.json_ptr(from).ptr_remove(json_obj)
    this.json_ptr(path).ptr_add(json_obj, value)
    return json_obj },

  $copy({from, path}, json_obj) {
    let value = this.json_ptr(from).ptr_get(json_obj)
    if (undefined === value)
      throw new Error('from target[key] is undefined')

    value = structuredClone(value)
    this.json_ptr(path).ptr_add(json_obj, value)
    return json_obj },

  $test({path, value}, json_obj) {
    let src_value = this.json_ptr(path).ptr_get(json_obj)
    if (!test_equal(src_value, value))
      throw new Error('json_patch test fail')
    return json_obj },
}

export function test_equal(a, b) {
  let ta=typeof a, tb=typeof b
  if (null==a || null==b || 'object'!==ta || 'object'!==tb)
    return ta===tb && a==b

  if (Array.isArray(a)) { // array equal
    let len = Array.isArray(b) ? b.length : null
    let i=0, ans = (len == a.length)
    for (;ans && i<len;i++)
      ans = test_equal(a[i], b[i])
    return ans

  } else { // object equal
    a = Object.entries(a)
    b = new Map(Object.entries(b))
    let ans = a.length == b.size
    for ([k,v] of a)
      if (!(ans &&= test_equal(v, b.get(k))))
        break

    return ans
  }
}

