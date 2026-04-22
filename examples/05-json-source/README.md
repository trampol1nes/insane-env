# 05 — JSON source

Kubernetes ConfigMaps are often mounted as JSON. EnvSupreme parses `.json`
directly.

Notes:

- Top-level must be an object (not an array)
- Non-string leaves are JSON-stringified before reaching the hook — run your
  validation library to coerce back to number/boolean.
- `sources: []` disables the default `process.env` overlay, so the example
  output reflects just the file.
