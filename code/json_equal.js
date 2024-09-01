export function json_equal(a, b) {
  let ta=typeof a, tb=typeof b
  if (null==a || null==b || 'object'!==ta || 'object'!==tb)
    return ta===tb && a==b

  ta=Array.isArray(a); tb=Array.isArray(a)
  if (ta && tb) { // array equal
    let i=0, len = b.length, ans = (len == a.length)
    for (;ans && i<len;i++)
      ans = json_equal(a[i], b[i])
    return ans

  } else if (ta || tb) {
    return true // chagne of JSON type

  } else { // object equal
    a = Object.entries(a)
    b = new Map(Object.entries(b))
    let ans = a.length == b.size
    for (let [k,v] of a)
      if (!(ans &&= json_equal(v, b.get(k))))
        break

    return ans
  }
}


