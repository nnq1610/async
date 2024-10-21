module.exports = (app, container) => {
    const {checkKeyCloakToken} = container.resolve('middleware')

    // app.use(checkKeyCloakToken)
    require('./eventsLog.api')(app, container)
}