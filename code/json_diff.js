export const json_diff_alg = {
  * diff(a, b, path=[]) {
    if (null == a || null == b) {
      // one was nullish, diff when not identical
      if (a !== b)
        yield {path, a, b}
      return
    }

    let ta = typeof a, tb = typeof b
    if ('object' !== ta || 'object' !== tb) {
      // one was not an object, diff when not equal
      if (a != b)
        yield {path, a, b}
      return
    }

    ta = Array.isArray(a); tb = Array.isArray(a)
    if (ta && tb) // both are arrays
      return yield * this.vec_diff(a, b, path)
    if (!ta && !tb) // both are objects
      return yield * this.obj_diff(a, b, path)

    // change of JSON type or other fall-through
    yield {path, a, b}
  },

  vec_diff(a, b, path=[]) {
    // many potential vector diff algorithms, so keep it simple
    return this._kv_diff(Number, a, b, path)
  },
  obj_diff(a, b, path=[]) {
    return this._kv_diff(String, a, b, path)
  },
  * _kv_diff(xform, a, b, path=[]) {
    let a_keys = new Set(Object.keys(a).map(xform)), b_keys = new Set(Object.keys(b).map(xform))

    // changed
    for (k of a_keys.intersection(b_keys))
      yield * this.diff(a[k], b[k], path.concat([k]))

    // added
    for (k of b_keys.difference(a_keys))
      yield {path: path.concat([k]), b:b[k]}

    // removed
    for (var k of a_keys.difference(b_keys))
      yield {path: path.concat([k]), a:a[k]}
  },
}

export const json_diff = (a, b, path) =>
  Array.from(iter_json_diff(a,b,path))

export const iter_json_diff = (a, b, path) =>
  json_diff_alg.diff(a, b, path)

