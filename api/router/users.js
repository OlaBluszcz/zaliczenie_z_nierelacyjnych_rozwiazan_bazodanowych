const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Import bcrypt.
const bcrypt = require("bcrypt");

// Import JBT.
const jwt = require("jsonwebtoken");

// Import models.
const User = require("../models/user");

// Zakładanie konta.

router.post("/signup", (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) return res.status(500).json({wiadomość: err})
    
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hash
    }) 

    user.save()
    .then(() => res.status(200).json({wiadomość: "Dodano użytkownika."}))
    
    })
});

// Logowanie.
router.post("/login", (req, res, next) => {
    // Sprawdzenie czy istnieje taki email.
    User
    .findOne({email: req.body.email})
    .then(user => {
        // Jeśli istnieje to pobieram obiekt usera.
        if(!user)
            return res.status(401).json({wiadomość: "Błąd autoryzacji."})

        // Weryfikacja hasha.
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if(err)
                return res.status(500).json({wiadomość: err})
            if(!result)
                return res.status(401).json({wiadomość: "Błąd autoryzacji."})
            // Jeśli jest ok to zwracam JWT.
            const token = jwt.sign(
                {user: user._id, email: user.email},
                process.env.JWTkey,
                {expiresIn: "1d"}
            )

            return res.status(200).json({token})
        });
    })
});


module.exports = router;