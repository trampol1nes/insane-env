export function deepFreeze<T>(input: T): Readonly<T> {
  const seen = new WeakSet<object>();
  freezeRecursive(input, seen);
  return input as Readonly<T>;
}

function freezeRecursive(value: unknown, seen: WeakSet<object>): void {
  if (value === null || typeof value !== "object") return;
  if (seen.has(value as object)) return;
  seen.add(value as object);

  for (const key of Reflect.ownKeys(value as object)) {
    const descriptor = Object.getOwnPropertyDescriptor(value as object, key);
    if (!descriptor || !("value" in descriptor)) continue;
    freezeRecursive(descriptor.value, seen);
  }

  Object.freeze(value);
}
