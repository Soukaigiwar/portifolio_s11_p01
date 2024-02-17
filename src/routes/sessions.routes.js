const { Router } = require("express");

const SessionsControler = require("../controllers/SessionsController");
const sessionsController = new SessionsControler();

const sessionsRoutes = Router();
sessionsRoutes.post("/", sessionsController.create);

module.exports = sessionsRoutes;