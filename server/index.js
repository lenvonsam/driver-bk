const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

const proxyRoute = require('./proxy')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  app.use(cookieParser())
  app.use(
    session({
      secret: 'zhdriverbk',
      name: 'zhdriverbk',
      cookie: { maxAge: 7200000 },
      resave: false,
      saveUninitialized: true
    })
  )
  app.use(bodyParser.json())
  app.use('/proxy', proxyRoute)
  // Give nuxt middleware to express
  app.get('/MP_verify_4vvERZyihOrDDGOh.txt', (req, res) => {
    res.send('4vvERZyihOrDDGOh')
  })
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
