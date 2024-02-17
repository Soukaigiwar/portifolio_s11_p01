const { response } = require("express");
const knex = require("../database/knex");
const AppError = require("../utils/AppError");


class MovieNotesController {
    async create(request, response) {
        const { title, description, rating, tags } = request.body;
        const user_id = request.user.id;

        try {
            const validateUserId = await knex("users").where('id', user_id).first();

            if (!validateUserId) {
                throw new AppError("Usuário inválido");
            };

            if (!rating || rating < 1 || rating > 5) {
                throw new AppError("A avaliação (rating) precisa ser entre 1 e 5.");
            };

            if (!tags) {
                throw new AppError("Precisa ter alguma tag.");
            };
        } catch (error) {
            throw new AppError("Erro ao recuperar dados do filme.");
        };

        const [movie_note_id] = await knex("movie_notes").insert({
            title,
            description,
            user_id,
            rating
        });

        if (tags.length !== 0) {
            const movieTagsInsert = tags.map(name => {
                name = name.toLowerCase();

                return {
                    movie_note_id,
                    user_id,
                    name
                };
            });

            try {
                await knex("movie_tags").insert(movieTagsInsert);
            } catch (error) {
                throw new AppError("Erro ao inserir dados do filme.");
            };
        };

        return response.status(201).json();
    };

    async show(request, response) {
        const { id } = request.params;
        const user_id = request.user.id;

        try {
            const movieNote = await knex("movie_notes")
                .where({ user_id })
                .where({ id })
                .first();
            const movieTags = await knex("movie_tags")
                .where({ user_id })
                .where({ movie_note_id: id })
                .orderBy("name");
            return response.json({
                ...movieNote,
                movieTags
            });
        } catch (e) {
            throw new AppError("Erro ao buscar informações do filme.");
        }

    };

    async index(request, response) {
        const user_id = request.user.id;
        const { title, tags } = request.query;

        const titleTrimmed = title ? title.trim() : "";
        let movieNotes;

        if (tags) {
            const filterTags = tags.split(',').map(tag => tag.trim());

            movieNotes = await knex("movie_tags")
                .select([
                    "movie_notes.id",
                    "movie_notes.title",
                    "movie_notes.description",
                    "movie_notes.rating"
                ])
                .where("movie_notes.user_id", user_id)
                .whereLike("movie_notes.title", `%${titleTrimmed}%`)
                .whereIn("name", filterTags)
                .innerJoin("movie_notes", "movie_notes.id", "movie_tags.note_id")
                .orderBy("movie_notes.title");
        } else {
            movieNotes = await knex("movie_notes")
                .select([
                    "movie_notes.id",
                    "movie_notes.title",
                    "movie_notes.description",
                    "movie_notes.rating"
                ])
                .where({ user_id })
                .whereLike("title", `%${titleTrimmed}%`)
                .orderBy("title");
        };

        const userTags = await knex("movie_tags")
            .where({ user_id });

        const moviesWithTags = movieNotes.map(movieNote => {
            const currentMovieTags = userTags.filter(tag => tag.movie_note_id === movieNote.id);

            return {
                ...movieNote,
                tags: currentMovieTags
            };
        });

        return response.json(moviesWithTags);
    };

    async update(request, response) {
        const { id, title, description, rating, tags } = request.body;
        const user_id = request.user.id;

        try {
            await knex("movie_tags")
                .where({ movie_note_id: id })
                .delete();

            const movieTagsInsert = tags.map(name => {
                name = name.toLowerCase();
                return {
                    movie_note_id: id,
                    user_id,
                    name
                };
            });

            await knex("movie_tags").insert(movieTagsInsert);

            await knex("movie_notes")
                .update({
                    title,
                    rating,
                    description
                })
                .where({ id });

            return response.status(200).json();
        } catch (error) {
            throw new AppError("Erro ao atualizar dados do filme");
        };
    };

    async delete(request, response) {
        const { id } = request.params;
        const user_id = request.user.id;

        const movieNote = await knex("movie_notes")
            .where({ user_id })
            .where({ id }).first();

        if (!movieNote) {
            throw new AppError("error: Não encontrado", 404);
        } else {
            await knex("movie_notes").where({ id }).delete();
            return response.status(204).json({ id });
        };
    };
};

module.exports = MovieNotesController;
