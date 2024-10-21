module.exports = (container) => {
    const logger = container.resolve('logger');
    const {httpCode,serverHelper } =  container.resolve('config')
    const {eventsRepo} = container.resolve('repo')

    const getLogs =  async(req, res) => {
       try {
           const filter = {
               search: req.query.search || '',
               state: req.query.state,
               source_system: req.query.source_system,
               task_name: req.query.task_name,
               from_date: req.query.from_date,
               to_date: req.query.to_date,
               page: parseInt(req.query.page,10) || 1,
               limit: parseInt(req.query.limit,10) || 50,
           }

           const logs = await eventsRepo.getLogs(filter)
           return res.status(httpCode.SUCCESS).json({
               data: logs,
               page: filter.page,
               limit: filter.limit,
           })
       }catch(err) {
           console.error('Error in getLOgsController:', err)
           res.status(httpCode.UNKNOWN_ERROR).json({msg: 'Unknown error'})

       }
    }

    const updateLogs = async(req, res) => {
        try {
            const {ids, newState} = req.body
            if (!ids || !newState) {
                return res.status(httpCode.BAD_REQUEST).json({ msg: 'Thiếu thông tin IDs hoặc newState.' });
            }
            const result = await eventsRepo.updateLogs(ids, newState)
            return res.status(httpCode.SUCCESS).json({
                msg: result.msg,
                updatedLogs:  result.updatedLogs
            })

        }catch(err) {
            console.error('Lỗi trong updateLogs: ', err)
            return res.status(httpCode.UNKNOWN_ERROR).json({ msg: 'Lỗi không xác định' });
        }
    }
    return {getLogs, updateLogs}
}