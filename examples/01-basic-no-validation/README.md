# 01 — Basic, no validation

Load a `.env` file and receive a deeply frozen raw string map.
No validation hook means values stay as `string` — zero coercion overhead.
