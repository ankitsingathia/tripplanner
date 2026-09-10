/**
 * The single place an error becomes an HTTP response.
 *
 * Anything thrown in a service or passed to `next(error)` lands here. Errors
 * carrying a `status` (see HttpError) keep it; anything else is an unexpected
 * failure and reports as a 500.
 */
export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    // Generic on purpose: this handler serves every route, and the old
    // fallback ("Unable to generate trip.") mislabelled search and nearby
    // failures.
    message: error.message || "Something went wrong."
  });
}
