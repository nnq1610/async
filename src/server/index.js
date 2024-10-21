const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const bodyParser = require('body-parser')
const api = require('../api')
// TODO: sentry integration 1
// const Sentry = require('@sentry/node')
// const Tracing = require('@sentry/tracing')
const start = (container) => {
    return new Promise((resolve, reject) => {
        const { serverSettings } = container.resolve('config')
        const { port } = serverSettings
        const repo = container.resolve('repo')
        if (!repo) {
            reject(new Error('The server must be started with a connected repository'))
        }
        if (!port) {
            reject(new Error('The server must be started with an available port'))
        }
        const app = express()
        app.get('/health', (req, res) => {
            res.status(200).send(process.env.VERSION || '')
        })
        // TODO: sentry integration 2
        // Sentry.init({
        //     dsn: 'https://ab76643c42bd430483095ceaf531d2c1@sentry.carpla.dev/36',
        //     integrations: [
        //         // enable HTTP calls tracing
        //         new Sentry.Integrations.Http({ tracing: process.env.SENTRY_HttpTracing === 'true' }),
        //         // enable Express.js middleware tracing
        //         new Tracing.Integrations.Express({ app })
        //     ],
        //     environment: process.env.SERVICE_ENV || 'development',
        //     tracesSampleRate: !process.env.SENTRY_tracesSampleRate ? 1.0 : +process.env.SENTRY_tracesSampleRate
        // })

        // app.use(Sentry.Handlers.requestHandler())
        // app.use(Sentry.Handlers.tracingHandler())
        morgan.token('body', function (req) { return JSON.stringify(req.body) })
        app.use(morgan(':method :url :remote-addr :status :response-time ms - :res[content-length] :body - :req[content-length]'))
        app.use(bodyParser.json({ limit: '50mb' }))
        app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
        app.use(helmet())
        app.use(cors())
        // app.use(checkAccessToken)
        app.get('/debug-sentry', function mainHandler (req, res) {
            throw new Error('My first Sentry error!')
        })
        // app.use(Sentry.Handlers.errorHandler())
        app.use((err, req, res, next) => {
            reject(new Error('Something went wrong!, err:' + err))
            res.status(500).send('Something went wrong!')
            return next()
        })
        api(app, container)
        const server = app.listen(port, () => resolve(server))
    })
}
module.exports = { start }
