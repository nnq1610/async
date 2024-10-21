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

        const result = await pool.query(query, queryParams);
        return result.rows;
    }
    async function updateLogs(ids, newStates) {
        const validateStates = ["retry", "cancel", "done"]
        if(!Array.isArray(ids) || ids.length === 0) {
            throw new Error("Không có id để cập nhật")
        }
        if(!Array.isArray(newStates) || newStates.length !== ids.length) {
            throw new Error("Số lượng ID và trạng thái không khớp")
        }
        for(const state of newStates) {
            if(!validateStates.includes(state)) {
                throw new Error(`Trang thai ${state} khong hop le`)
            }
        }
        let query =  `
            UPDATE "event_log"
            SET state = CASE id
    `;
        ids.forEach((id, index) => {
            query += ` WHEN $${index * 2 + 1} THEN $${index * 2 + 2}`;
        });

        query += ` END WHERE id IN (${ids.map((_, index) => `$${index * 2 + 1}`).join(', ')}) RETURNING *;`;

        // Mảng queryParams sẽ chứa cả ids và newStates
        const queryParams = [];
        ids.forEach((id, index) => {
            queryParams.push(id, newStates[index]);
        });
        try {
            const result = await pool.query(query, queryParams);

            return {
                msg: `${result.rowCount} logs cập nhật thành công`,
                updatedLogs: result.rows
            }
        } catch(err) {
            console.error(('Lỗi cập nhật logs'))
            throw err;
        }


    }


    return {getLogs, updateLogs};
}