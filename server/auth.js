const auth = require('basic-auth')

module.exports = (request, response, next) => {
  const user = auth(request)

  if (user) {
    const usename = 'koyonakamura'
    const password = '1000'

    if (user.name === usename && user.pass === password) {
      return next()
    }
  }

  response.set('WWW-Authenticate', 'Basic realm="example"')
  return response.status(401).send()}
