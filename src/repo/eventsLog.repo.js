module.exports = container => {
    const pool = container.resolve('db');
    async function getLogs(filters) {
        const {
            search = '',
            state,
            source_system,
            task_name,
            from_date,
            to_date,
            page = 1,
            limit = 50
        } = filters;

        let query = `SELECT * FROM "event_log" WHERE 1=1`;
        const queryParams = [];
        if (search) {
            queryParams.push(`%${search}%`);
            query += ` AND (log ILIKE $${queryParams.length} OR data ILIKE $${queryParams.length} OR log_message ILIKE $${queryParams.length})`;
        }
        if (state) {
            queryParams.push(state);
            query += ` AND state = $${queryParams.length}`;
        }
        if (source_system) {
            queryParams.push(source_system);
            query += ` AND source_system = $${queryParams.length}`;
        }
        if (task_name) {
            queryParams.push(task_name);
            query += ` AND task_name = $${queryParams.length}`;
        }
        if (from_date) {
            queryParams.push(from_date);
            query += ` AND created_at >= $${queryParams.length}`;
        }
        if (to_date) {
            queryParams.push(to_date);
            query += ` AND created_at <= $${queryParams.length}`;
        }


        const pagination = (page - 1) * limit;
        query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, pagination);

        try {
            const result = await pool.query(query, queryParams);
            return result.rows;
        } catch (error) {
            console.error('Error executing query', error);
            throw error;
        }
    }
//     Cập nhật cho phép chọn nhiều bản ghi:
//         Cần xác nhận khi cập nhật, phân trang 1 trang 50 bản ghi
//     Cập nhật state=’retry’
// Cập nhật state=’cancel’
// Cập nhật state=’done’
//     async function updateLogs()
//     return {getLogs}
}