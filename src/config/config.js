const serverSettings = {
    port: process.env.PORT || 8000,
    basePath: process.env.BASE_PATH || ''
}

const httpCode = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    TOKEN_EXPIRED: 409,
    UNKNOWN_ERROR: 520,
    FORBIDDEN: 403,
    ADMIN_REQUIRE: 406,
    UNAUTHORIZED: 401
}

const dbSettings = {
    db: process.env.DB || 'event-sync-cobao',
    user: 'common',
    pass: "BCbGCMszFYNIgLN4",
    repl: process.env.DB_REPLS || '',
    servers: (process.env.DB_SERVERS)
        ? process.env.DB_SERVERS.split(',') : [
        '10.62.6.51:5434'
    ]
}

const serverHelper = function () {
    const jwt = require('jsonwebtoken')
    const crypto = require('crypto')
    const secretKey = process.env.SECRET_KEY || '123'
    const secretKeyCMS = process.env.SECRET_KEY_CMS || '1223456ABC@!'

    function decodeToken (token) {
        return jwt.decode(token)
    }

    function genToken (obj) {
        return jwt.sign(obj, secretKey, { expiresIn: '1d' })
    }

    function verifyToken (token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secretKey, (err, decoded) => {
                err ? reject(new Error(err)) : resolve(decoded)
            })
        })
    }

    function verifyCMSToken (token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secretKeyCMS, (err, decoded) => {
                err ? reject(new Error(err)) : resolve(decoded)
            })
        })
    }

    function encryptPassword (password) {
        return crypto.createHash('sha256').update(password, 'binary').digest('base64')
    }

    function stringToSlug (str) {
        const from = 'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ'
        const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy'
        for (let i = 0, l = from.length; i < l; i++) {
            str = str.replace(RegExp(from[i], 'gi'), to[i])
        }

        str = str.toLowerCase()
            .trim()
            .replace(/[^a-z0-9 \-]/g, '')
            .replace(/ +/g, '-')

        return str
    }

    function stringToSlugNews (str) {
        const from = 'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ'
        const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy'
        for (let i = 0, l = from.length; i < l; i++) {
            str = str.replace(RegExp(from[i], 'gi'), to[i])
        }

        str = str.toLowerCase()
            .trim()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/ +/g, '-')

        return str + '-' + (Date.now() / 1000).toString()
    }

    function stringToSlugSearch (str) {
        const from = 'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ'
        const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy'
        for (let i = 0, l = from.length; i < l; i++) {
            str = str.replace(RegExp(from[i], 'gi'), to[i])
        }

        str = str.toLowerCase()
            .trim()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/ +/g, '-')

        return str
    }

    function deepCompare (x, y) {
        let i, l, leftChain, rightChain

        function compare2Objects (x, y) {
            let p

            // remember that NaN === NaN returns false
            // and isNaN(undefined) returns true
            if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
                return true
            }

            // Compare primitives and functions.
            // Check if both arguments link to the same object.
            // Especially useful on the step where we compare prototypes
            if (x === y) {
                return true
            }

            // Works in case when functions are created in constructor.
            // Comparing dates is a common scenario. Another built-ins?
            // We can even handle functions passed across iframes
            if ((typeof x === 'function' && typeof y === 'function') ||
                (x instanceof Date && y instanceof Date) ||
                (x instanceof RegExp && y instanceof RegExp) ||
                (x instanceof String && y instanceof String) ||
                (x instanceof Number && y instanceof Number)) {
                return x.toString() === y.toString()
            }

            // At last checking prototypes as good as we can
            if (!(x instanceof Object && y instanceof Object)) {
                return false
            }

            if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
                return false
            }

            if (x.constructor !== y.constructor) {
                return false
            }

            if (x.prototype !== y.prototype) {
                return false
            }

            // Check for infinitive linking loops
            if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
                return false
            }
            // Quick checking of one object being a subset of another.
            // todo: cache the structure of arguments[0] for performance

            for (p in y) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false
                } else if (typeof y[p] !== typeof x[p]) {
                    return false
                }
            }

            for (p in x) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false
                } else if (typeof y[p] !== typeof x[p]) {
                    return false
                }

                switch (typeof (x[p])) {
                    case 'object':
                    case 'function':

                        leftChain.push(x)
                        rightChain.push(y)

                        if (!compare2Objects(x[p], y[p])) {
                            return false
                        }

                        leftChain.pop()
                        rightChain.pop()
                        break

                    default:
                        if (x[p] !== y[p]) {
                            return false
                        }
                        break
                }
            }

            return true
        }

        if (arguments.length < 1) {
            return true //Die silently? Don't know how to handle such case, please help...
            // throw "Need two or more arguments to compare";
        }

        for (i = 1, l = arguments.length; i < l; i++) {

            leftChain = [] //Todo: this can be cached
            rightChain = []

            if (!compare2Objects(arguments[0], arguments[i])) {
                return false
            }
        }

        return true
    }
    function formatRegex (str) {
        const re = /([[\\^$.|?*+()])/g
        return new RegExp(str.replace(re, '\\$1'), 'gi')
    }
    return {
        decodeToken,
        encryptPassword,
        verifyToken,
        genToken,
        stringToSlug,
        stringToSlugNews,
        verifyCMSToken,
        stringToSlugSearch,
        deepCompare,
        formatRegex
    }
}
module.exports = { dbSettings, serverHelper: serverHelper(), serverSettings, httpCode }
