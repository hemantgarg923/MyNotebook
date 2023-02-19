const jwt = require('jsonwebtoken');
const secretKey = "goodeno@ughk$y";

const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json("invalid token");
    }

    try {
        let data = jwt.verify(token, secretKey);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).json("invalid token2");
    }
}

module.exports = fetchuser;