const { hash, compare } = require("bcryptjs");
const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const EvalNewPassword = require("../utils/EvalNewPassword");

class UsersControllers {
    async index(request, response) {
        const users = await knex("users");

        if (!users) {
            throw new AppError("Nenhum usuário cadastrado");
        };

        return response.json(users);
    };

    async create(request, response) {
        const { name, email, password } = request.body;
        console.log(name, email);
        
        const emailExist = await knex("users").where({ email }).first();
        
        if (emailExist) {
            throw new AppError("Email já cadastrado.", 401);
        };
        
        const evalNewPassword = new EvalNewPassword;
        const newPasswordEvaluated = evalNewPassword.checkIfPasswordIsValid(password);
        //console.log(JSON.stringify(newPasswordEvaluated))

        if (!newPasswordEvaluated) {
            throw new AppError("A senha não atende os requisitos mínimos.", 401);
        }

        const hashedPassword = await hash(password, 8);

        await knex("users").insert({ name, email, password: hashedPassword });

        return response.status(201).json();
    };

    async update(request, response) {
        const { name, email, old_password, new_password } = request.body;
        const user_id = request.user.id;

        const user = await knex("users").where('id', user_id).first();

        if (!user) {
            throw new AppError("Usuário não encontrado.", 401);
        };

        const emailExist = await knex("users").where({ email }).first();

        if (emailExist && emailExist.id !== user.id) {
            throw new AppError("Email já está em uso.", 401);
        };

        user.name = name ?? user.name;
        user.email = email ?? user.email;

        if (new_password && !old_password) {
            throw new AppError("Precisa informar a senha antiga.", 401);
        };

        if (new_password && old_password) {
            const validateOldPassword = await compare(old_password, user.password);

            if (!validateOldPassword) {
                throw new AppError("Senha antiga inválida", 401);
            };

            user.password = await hash(new_password, 8);
        };

        const evalNewPassword = new EvalNewPassword;
        const newPasswordEvaluated = evalNewPassword.checkIfPasswordIsValid(new_password);

        if (new_password === "" && old_password === "") {
            await knex("users").where('id', user_id).update({
                name,
                email,
                updated_at: knex.fn.now()
            });

            return response.status(200).json();
        } else {
            if (new_password.length >= 8 && newPasswordEvaluated) {
                await knex("users").where('id', user_id).update({
                    name,
                    email,
                    password: user.password,
                    updated_at: knex.fn.now()
                });

                return response.status(200).json();
            } else {
                throw new AppError("A senha não atende os requisitos mínimos.", 401);
            };
        }

        // Default password: !234qwerT



    };
};

module.exports = UsersControllers;
