class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof ValidationError) {
    res.status(400).json({ errors: err.message });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({ errors: err.message });
    return;
  }

  res.status(500).send("Oops, unknown error");
}

export { ValidationError };
