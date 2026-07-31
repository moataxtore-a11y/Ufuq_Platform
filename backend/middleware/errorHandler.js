function errorHandler(err, req, res, next) {
  const status = err.status || 500

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err)
  }

  const isProd = process.env.NODE_ENV === 'production'
  const message = isProd && status >= 500 ? 'Internal Server Error' : (err.message || 'Internal Server Error')

  res.status(status).json({ message })
}

module.exports = { errorHandler }
