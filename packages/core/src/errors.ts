export class EnvSupremeLoadError extends Error {
  override readonly name = "EnvSupremeLoadError";
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

export class EnvSupremeValidationError extends Error {
  override readonly name = "EnvSupremeValidationError";
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

export class NotImplementedError extends Error {
  override readonly name = "NotImplementedError";
  constructor(message: string) {
    super(message);
  }
}
