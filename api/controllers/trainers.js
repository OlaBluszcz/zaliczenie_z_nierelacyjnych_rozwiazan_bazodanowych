const mongoose = require("mongoose");

const Trainer = require("../models/trainers");

// Pobieranie wszystkich trenerów z bazy danych.
// Trenerzy bez zajęć i szkół.
exports.trainers_get_all = async (req, res) => {
    try {
        const trainers = await Trainer.aggregate([
            { 
                $project: { 
                    name: 1, 
                    bio: 1,
                    experience: 1, 
                    contact: 1 
                } 
            }
        ]);

        console.log("Znalezieni trenerzy:", trainers);
        res.status(200).json(trainers);
    } catch (err) {
        console.error("Błąd zapytania do MongoDB:", err);
        res.status(500).json({ error: "Błąd podczas pobierania danych trenerów", message: err.message });
    }
};

  
// Dodawanie nowego trenera do bazy.
exports.trainers_add_new = (req, res, next) => {
    const newtrainer = new Trainer({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        bio: req.body.bio,
        experience: req.body.experience,
        contact: req.body.contact,
        school: req.body.school,
        classes: req.body.classes
    });

    newtrainer.save()
        .then(result => {
            res.status(201).json({
                message: "Utworzono nowego trenera.",
                data: result
            });
        })
        .catch(err => {
            console.error("Błąd podczas tworzenia trenera:", err);
            res.status(500).json({ message: "Wystąpił błąd podczas tworzenia trenera.", error: err.message });
        });
};

// Pokazywanie trenera i szkoły w której pracuje i jakie zajęcia udziela.
exports.trainers_get_by_id = async (req, res) => {
    const id = req.params.trainerId;

    // Walidacja ID.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Nieprawidłowy ID trenera." });
    }

    try {
        const result = await Trainer.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } }, 
            {
                $lookup: {
                    from: "schools", 
                    localField: "school", 
                    foreignField: "_id",
                    as: "school",
                },
            },
            {
                $lookup: {
                    from: "classes", 
                    localField: "_id", 
                    foreignField: "trainer", 
                    as: "classes",
                },
            },
            {
                $unwind: { path: "$school", preserveNullAndEmptyArrays: true }, 
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    bio: 1,
                    experience: 1,
                    contact: 1,
                    school: {
                        _id: "$school._id",
                        name: "$school.name",
                        address: "$school.address",
                        contact: "$school.contact",
                    },
                    classes: {
                        $map: {
                            input: "$classes",
                            as: "class",
                            in: {
                                _id: "$$class._id",
                                name: "$$class.name",
                                level: "$$class.level",
                                price: "$$class.price",
                                date: "$$class.date",
                                time: "$$class.time",
                            },
                        },
                    },
                },
            },
        ]);

        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Nie znaleziono trenera o podanym ID." });
        }

        res.status(200).json({
            message: "Szczegóły trenera",
            data: result[0],
        });
    } catch (err) {
        console.error("Błąd podczas pobierania szczegółów trenera:", err);
        res.status(500).json({ message: "Błąd podczas pobierania danych trenera.", error: err.message });
    }
};

// Aktualizowanie pełnych danych trenera.
exports.trainers_update = (req, res, next) => {
    const id = req.params.trainerId;
    const updatedData = {
        name: req.body.name,
        bio: req.body.bio,
        experience: req.body.experience,
        contact: req.body.contact,
        school: req.body.school,
        classes: req.body.classes,
    };

    Trainer.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true })
        .then(async (updatedTrainer) => {
            if (!updatedTrainer) {
                return res.status(404).json({ message: "Nie znaleziono trenera o podanym ID do aktualizacji." });
            }
            const populatedTrainer = await Trainer.findById(id)
                .populate('school', 'name')
                .populate('classes', 'name');

            res.status(200).json({
                message: `Zaktualizowano dane trenera: ${populatedTrainer.name}`,
                data: {
                    name: populatedTrainer.name,
                    bio: populatedTrainer.bio,
                    experience: populatedTrainer.experience,
                    contact: populatedTrainer.contact,
                    school: populatedTrainer.school,
                    classes: populatedTrainer.classes,
                },
            });
        })
        .catch(err => {
            console.error("Błąd podczas aktualizacji trenera:", err);
            res.status(500).json({ message: "Wystąpił błąd podczas aktualizacji trenera.", error: err.message });
        });
};

// Częściowe aktualizowanie danych trenera na podstawie przesłanych pól.
exports.trainers_patch = async (req, res, next) => {
    const id = req.params.trainerId;
    const patchData = req.body;

    // Walidacja ID.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Nieprawidłowy ID trenera." });
    }

    try {
        const updatedTrainer = await Trainer.findByIdAndUpdate(id, patchData, {
            new: true, 
            runValidators: true, 
        });

        if (!updatedTrainer) {
            return res.status(404).json({ message: "Nie znaleziono trenera o podanym ID do aktualizacji." });
        }

        const populatedTrainer = await Trainer.findById(id)
            .populate('school', 'name address contact') 
            .populate('classes', 'name level price date time'); 

        res.status(200).json({
            message: `Częściowo zaktualizowano dane trenera: ${populatedTrainer.name}`,
            data: {
                name: populatedTrainer.name,
                bio: populatedTrainer.bio,
                experience: populatedTrainer.experience,
                contact: populatedTrainer.contact,
                school: populatedTrainer.school, 
                classes: populatedTrainer.classes, 
            },
        });
    } catch (err) {
        console.error("Błąd podczas częściowej aktualizacji trenera:", err);
        res.status(500).json({
            message: "Wystąpił błąd podczas częściowej aktualizacji trenera.",
            error: err.message,
        });
    }
};

// Usuwanie trenera z bazy danych.
exports.trainers_delete = (req, res, next) => {
    const id = req.params.trainerId;

    Trainer.findById(id)
        .populate('school', 'name')
        .populate('classes', 'name')
        .then(trainerToDelete => {
            if (!trainerToDelete) {
                return res.status(404).json({ message: "Nie znaleziono trenera o podanym ID do usunięcia." });
            }

            // Usunięcie trenera.
            return Trainer.findByIdAndDelete(id).then(() => {
                res.status(200).json({
                    message: `Usunięto trenera: ${trainerToDelete.name}`,
                    data: {
                        name: trainerToDelete.name,
                        school: trainerToDelete.school,
                        classes: trainerToDelete.classes,
                    },
                });
            });
        })
        .catch(err => {
            console.error("Błąd podczas usuwania trenera:", err);
            res.status(500).json({ message: "Wystąpił błąd podczas usuwania trenera.", error: err.message });
        });
};

// Obsługiwanie żądania HEAD dla pojedynczego trenera.
exports.trainers_head = (req, res, next) => {
    const id = req.params.trainerId;

    Trainer.findById(id)
        .then(result => {
            if (!result) {
                return res.status(404).json({ message: "Nie znaleziono trenera o podanym ID." });
            }

            res.status(200).set({
                "Content-Type": "application/json",
                "Content-Length": JSON.stringify(result).length,
            }).end();
        })
        .catch(err => {
            console.error("Błąd podczas obsługi żądania HEAD:", err);
            res.status(500).json({ message: "Wystąpił błąd podczas obsługi żądania HEAD.", error: err.message });
        });
};

// Obsługiwanie żądania OPTIONS, zwracając dozwolone metody HTTP.
exports.handleOptions = (req, res) => {
    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
    res.status(204).send();
};