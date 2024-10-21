module.exports = (container) => {
    const {serverHelper, httpCode,logger} = container.resolve('config')
    const jwt = require('jsonwebtoken')
    const KEYCLOAK_CLIENT_ID= 'tasco-insurance-dev'
    const KEYCLOAK_CLIENT_SECRET = 'zGAWBis8qYDKFlEng9i8CsyPTbHHjXri'

    const checkKeyCloakToken = async (req, res, next) => {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(httpCode.UNAUTHORIZED).json({ msg: 'Token không hợp lệ.' });
            }
            const token = authHeader.split(' ')[1];
            if (token) {
                const data = await jwt.verify(token,KEYCLOAK_CLIENT_SECRET)
                if(data) {
                    const {sub} = data
                    if(sub.includes(KEYCLOAK_CLIENT_ID)) {
                        req.user = data
                        return next()
                    }
                }
                return res.status(httpCode.UNAUTHORIZED).json({ msg: 'Token không hợp lệ.' });

            }
            return res.status(httpCode.UNAUTHORIZED).json({ msg: 'Bạn không có quyền thực hiện tác vụ này.' })
        } catch (e) {
            if (!e.message.includes('TokenExpiredError')) {
                logger.e(e)
            }
            res.status(httpCode.TOKEN_EXPIRED).json({})
        }
    }
    return {checkKeyCloakToken}
}