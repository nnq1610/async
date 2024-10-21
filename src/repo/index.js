const repo = (container) => {
    const eventsRepo = require('./eventsLog.repo')(container)
    return { eventsRepo }
}
const connect = (container) => {
    const dbPool = container.resolve('db')
    if (!dbPool) throw new Error('Connect DB failed')
    return repo(container)
}

module.exports = { connect }
