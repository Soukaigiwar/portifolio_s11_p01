const { Router } = require("express");

const MovieNotesController = require("../controllers/MovieNotesControllers");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const movieNotesControllers = new MovieNotesController();

const movieNotesRoutes = Router();

movieNotesRoutes.use(ensureAuthenticated);


movieNotesRoutes.get("/:id", movieNotesControllers.show);
movieNotesRoutes.get("/", movieNotesControllers.index);
movieNotesRoutes.post("/", movieNotesControllers.create);
movieNotesRoutes.put("/:id", movieNotesControllers.update);
movieNotesRoutes.delete("/:id", movieNotesControllers.delete);

module.exports = movieNotesRoutes;