export const newPgError = (pgErr: Error, fn: Function) =>
  new Error(`Function failed: ${fn.name} due to error: ${pgErr.stack}`)