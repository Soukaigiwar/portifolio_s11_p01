const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const UsersControllers = require("../controllers/UsersControllers");
const UserAvatarController = require("../controllers/UserAvatarController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const usersController = new UsersControllers();
const userAvatarController = new UserAvatarController();

const usersRoutes = Router();
const upload = multer(uploadConfig.MULTER);

usersRoutes.post("/", usersController.create)
usersRoutes.put("/", ensureAuthenticated, usersController.update);
usersRoutes.get("/", ensureAuthenticated, usersController.index);
usersRoutes.patch("/avatar", ensureAuthenticated, upload.single("avatar"), userAvatarController.update);

module.exports = usersRoutes;
