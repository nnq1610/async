module.exports = (app, container) => {
    const { serverSettings } = container.resolve('config')
    const { basePath } = serverSettings
    const {eventsController} = container.resolve('controller')


    app.get(`${basePath}/getLogs`, eventsController.getLogs)

}
