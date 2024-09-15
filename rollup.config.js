import {readdirSync} from 'node:fs'
import terser from '@rollup/plugin-terser'

const js_files = file_name =>
  file_name.endsWith('.js') && !file_name.includes('test')

const _files_for_path = (path, fn_filter=js_files) =>
  readdirSync(path).filter(fn_filter).map(n => `${path}/${n}`)

export default {
  input: [ ... _files_for_path('./code') ],

  output: [
    { sourcemap: true,
      entryFileNames: '[name].js', dir: 'esm/', format: 'es', 
    },
    { sourcemap: false,
      plugins: [terser()],
      entryFileNames: '[name].min.js', dir: 'esm/', format: 'es', 
    },
  ]
}
