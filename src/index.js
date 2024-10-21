const { initDI } = require('./di');
const { name } = require('../package.json');
const config = require('./config');
const logger = require('./logger');
const middleware = require('./middleware');
const server = require('./server');
const controller = require('./controller');
const { connect } = require('./database');
const repo = require('./repo');
const EventEmitter = require('events').EventEmitter;

const mediator = new EventEmitter();
logger.d(`${name} Service starting...`);

mediator.once('di.ready', container => {

    container.registerValue('config', config);
    container.registerValue('logger', logger);
    container.registerValue('middleware', middleware)
    container.registerValue('mediator', mediator);

    mediator.once('db.ready', (db) => {
        logger.d('Database ready, starting server...');

        // Đăng ký database và các thành phần khác
        container.registerValue('db', db);
        const repository = repo.connect(container)
        container.registerValue('repo',repository)
        container.registerValue('controller', controller(container))
        container.registerValue('middleware', middleware(container))

        // Bắt đầu server
        server.start(container).then((app) => {
            console.log('Server started at port', app.address().port);
        }).catch((err) => {
            console.error('Error starting server:', err);
        });
    });

    connect(container, mediator);
});

initDI(mediator);
