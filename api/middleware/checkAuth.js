const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {

    // Pobranie tokenu z nagłówków.
    const token = req.headers.authorization.split(" ")[1]
    try {
        // Weryfikacja tokenu.
        jwt.verify(token, process.env.JWTkey)
    next()
    }
    // Obsługa błędu.
    catch(err) {
        return res.status(401).json({wiadomość: "Błąd autoryzacji"})
    }
}
// Debugowanie klucza JWT.
console.log('JWT Key:', process.env.JWTkey);