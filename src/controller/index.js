module.exports = (container) => {
    const eventsController= require('./eventsLog.controller')(container);
    return {eventsController}
}