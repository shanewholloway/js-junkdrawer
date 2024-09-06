// JSON Merge Patch per RFC 7396

const _is_not_obj = v => (
  null == v || 
  'object' !== typeof v || 
  Array.isArray(v) )

export const mimetype = 'application/merge-patch+json'

export function json_merge_patch(target, patch) {
  if (_is_not_obj(patch))
    return patch

  if (_is_not_obj(target))
    target = {} // Ignore the contents and set it to an empty Object

  for (let [name, value] of Object.entries(patch))
    if (null == value) delete target[name]
    else target[name] = json_merge_patch(target[name], value)

  return target
}

export default json_merge_patch
