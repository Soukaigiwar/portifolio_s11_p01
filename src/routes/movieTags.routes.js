const { Router } = require("express");

const MovieTagsControllers = require("../controllers/MovieTagsControllers");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const movieTagsController = new MovieTagsControllers();

const movieTagsRoutes = Router();

movieTagsRoutes.get("/", ensureAuthenticated, movieTagsController.index);

module.exports = movieTagsRoutes;
