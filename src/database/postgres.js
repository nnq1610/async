const { Pool } = require('pg');

// Hàm tạo connection string cho PostgreSQL
const getPostgresURL = (options) => {
    const server = options.servers[0]; // Chọn server đầu tiên để kết nối
    const credentials = options.user && options.pass
        ? `${options.user}:${options.pass}@`
        : '';
    return `postgresql://${credentials}${server}/${options.db}`;
};

// Hàm kết nối đến PostgreSQL
const connect = (container, mediator) => {
    const config = container.resolve('config')
    const { dbSettings } = config;
    if (!dbSettings) throw new Error('missing dbSettings');
    const connectionString = getPostgresURL(dbSettings);

    const pool = new Pool({
        connectionString,
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1); // Đóng ứng dụng nếu có lỗi không mong muốn
    });

    return pool.connect()
        .then(client => {
            console.log('Connected to PostgreSQL');
            mediator.emit('db.ready', client);
            return client; // Trả về client để sử dụng truy vấn sau này
        })
        .catch(err => {
            console.error('Error connecting to PostgreSQL', err.stack);
            throw err;
        });
};

module.exports = { connect };
