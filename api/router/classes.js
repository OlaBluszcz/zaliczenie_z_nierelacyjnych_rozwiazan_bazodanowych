const express = require("express");
const router = express.Router();

// Przeprowadzenie autoryzacji.
const checkAuth = require("../middleware/checkAuth");

// Importowanie kontrolera.
const ClassController = require("../controllers/classes");

// Endpointy.
router.get("/", checkAuth, ClassController.classes_get_all);

router.get("/:classId/reviews", checkAuth, ClassController.classes_get_reviews);

router.get("/:classId", checkAuth, ClassController.classes_get_by_id);

router.post("/", checkAuth, ClassController.classes_add_new);

router.post('/:classId/reviews', checkAuth, ClassController.classes_add_review);

router.put("/:classId", checkAuth, ClassController.classes_update);

router.patch('/:classId', checkAuth, ClassController.classes_patch); 

router.delete("/:classId", checkAuth, ClassController.classes_delete);

router.head("/:classId", checkAuth, ClassController.classes_head);

router.options('/:classId', checkAuth, ClassController.handleOptions);

module.exports = router;