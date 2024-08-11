// Just enough JSON Pointers to support [RFC 6902: JavaScript Object Notation (JSON) Patch](https://datatracker.ietf.org/doc/html/rfc6902/#section-3)

export function json_ptr(ptr_path, ...fmt_values) {
  if (ptr_path.map) // used as a template string function
    ptr_path = String.raw(ptr_path, ...fmt_values)

  let proto = this?.ptr_get ? this : _json_ptr_
  let res = proto.cache?.get(ptr_path)
  if (!res) {
    res = decode_ptr.call(proto, ptr_path)
    proto.cache?.set(ptr_path, Object.freeze(res))
  }
  return res
}

export default json_ptr
export const json_ptr_of = (ptr_path, tgt, no_throw) => json_ptr(ptr_path).ptr_of(tgt, no_throw)
export const json_ptr_get = (ptr_path, tgt) => json_ptr(ptr_path).ptr_get(tgt)
export const json_ptr_set = (ptr_path, tgt, value) => json_ptr(ptr_path).ptr_set(tgt, value)
export const json_ptr_delete = (ptr_path, tgt) => json_ptr(ptr_path).ptr_delete(tgt)
export const json_ptr_add = (ptr_path, tgt, value) => json_ptr(ptr_path).ptr_add(tgt, value)
export const json_ptr_remove = (ptr_path, tgt, value) => json_ptr(ptr_path).ptr_remove(tgt)


export const _json_ptr_ = {
  [Symbol.toStringTag]: 'json_ptr',
  [Symbol.toPrimitive]() { return this.ptr_path },

  bind(cache=new Map()) {
    return json_ptr.bind({__proto__: this, cache}) },

  ptr_get(json_obj) {
    let [tgt, key] = this.ptr_of(json_obj)
    return tgt[key]
  },

  ptr_set(json_obj, value) {
    let [tgt, key] = this.ptr_of(json_obj), res=tgt[key]
    tgt[key] = value
    return res
  },

  ptr_delete(json_obj) {
    let [tgt, key] = this.ptr_of(json_obj), res=tgt[key]
    delete tgt[key]
    return res
  },

  ptr_add(json_obj, value) {
    let [tgt, key] = this.ptr_of(json_obj)
    if (Array.isArray(tgt))
      tgt.splice(key, 0, value)
    else tgt[key] = value
    return tgt
  },

  ptr_remove(json_obj) {
    let [tgt, key] = this.ptr_of(json_obj), res
    if (Array.isArray(tgt))
      res = '-' === this.key
        ? tgt.pop()
        : tgt.splice(key, 1)[0]
    else {
      res = tgt[key]
      delete tgt[key]
    }
    return res
  },


  ptr_of(tgt, no_throw) {
    let err, {key, path} = this

    for (let k of path)
      tgt = tgt?.[k]

    if ('object' !== typeof (tgt ?? 0))
      err = `json_ptr target is ${null==tgt ? tgt : typeof tgt}`
    else if (Array.isArray(tgt))
      '-' === key ? key = tgt.length
      : isNaN(key) ? err = `json_ptr target invalid index`
      : 0;

    if (no_throw) return [err, tgt, key]
    if (err) throw new Error(err)
    return [tgt, key]
  },
}

// split on JSON Pointer characters
const _rx_json_ptr = /(\/|~0|~1)/

// JSON Pointer parser as a right-reduce implementation
const _rrinl_json_ptr = (_,sz,i,path) => (
    (i&1) // odd indexes are split chars from _rx_json_ptr
      ? ('/' === sz ? path.splice(i,1) // remove '/' from array
        : path[i-1] += ('~1'===sz ? '/':'~') + path.splice(i,2)[1] ) // replace escape char and combine 3 slots
      : path[i] = !sz || isNaN(sz) ? sz : Number(sz), // parse numbers
    path
  )

export function decode_ptr(ptr) {
  if ('/'!==ptr[0])
      throw new Error("Invalid JSON Pointer")

  var path = ptr.split(_rx_json_ptr)
    .reduceRight(_rrinl_json_ptr, 0)
  path.shift() // skip initial blank
  return {__proto__: this, ptr, path, key: path.pop()}
}


const _escape = p => null == p ? '' : '/' +
  (''+p)
    .replaceAll('~','~0')
    .replaceAll('/','~1')

export function encode_ptr(ptr_path) {
  if (ptr_path.map) ptr_path = {path: ptr_path}
  var p, sz = ''
  for (p of ptr_path.path)
    sz += _escape(p)
  return sz + _escape(ptr_path.key)
}
