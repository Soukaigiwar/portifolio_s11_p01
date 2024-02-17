const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");
const { compare } = require("bcryptjs");
const { sign } = require("jsonwebtoken");

class SessionControler {
    async create(request, response) {
        const { email, password } = request.body;

        console.log(email, "password is secret");

        const user = await knex("users").where({ email }).first();

        if (!user) {
            throw new AppError("Email ou senha incorreta", 401);
        };

        const passwordMatched = await compare(password, user.password);

        if (!passwordMatched) {
            throw new AppError("Email ou senha incorreta", 401);
        };

        const { secret, expiresIn } = authConfig.jwt;
        const token = sign({}, secret, {
            subject: String(user.id),
            expiresIn
        });

        return response.json({ user, token });
    };
};

module.exports = SessionControler;
