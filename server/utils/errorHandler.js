class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err instanceof ValidationError) {
    res.status(400).json({ errors: err.message });
  } else if (err instanceof Error) {
    res.status(500).json({ errors: err.message });
  } else {
    res.status(500).send("Oops, unknown error");
  }
}

export { ValidationError };
