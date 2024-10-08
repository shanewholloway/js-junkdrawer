// [RFC 6902: JavaScript Object Notation (JSON) Patch](https://datatracker.ietf.org/doc/html/rfc6902/#section-3)
import {json_ptr_cache} from './json_ptr.js'
import {json_equal} from './json_equal.js'

export function json_patch(operations, json_obj) {
  return (this || _json_patch_.use())
    .patch(operations, json_obj) }

export default json_patch


export const json_patch_cache = arg =>
  _json_patch_.use(arg)

export const _json_patch_ = {
  as_op: op => structuredClone(op),

  use(json_ptr) {
    if (!json_ptr?.call)
      json_ptr = json_ptr_cache(json_ptr)
    return { __proto__: this, json_ptr} },

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
      if (undefined === res)
        throw new Error('patch invalid')
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
    let [,tgt,key] = this.json_ptr(path).ptr_of(json_obj)
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
    if (!json_equal(src_value, value))
      throw new Error('json_patch test fail')
    return json_obj },
}

