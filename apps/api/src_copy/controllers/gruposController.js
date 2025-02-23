// controllers/gruposController.js

import { getGrupoById, getGrupoByCursoLetra } from '../services/grupos.js';
import { AppError, errorValidacion, notExpectedError } from '../utils/errors.js';

export function gruposControllerFactory(db) {
    return {
        async getGrupoById(req, res, next) {
            const idGrupo = Number(req.params.idGrupo);
            if (!Number.isInteger(idGrupo)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            try {
                const grupo = await getGrupoById(db, idGrupo); // Llama al servicio
                res.status(200).json(grupo);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        },

        async getGrupoByCursoLetra(req, res, next) {
            const curso = Number(req.query.curso); // Ahora en `query` en lugar de `body`
            const letra = req.query.letra;

            if (!Number.isInteger(curso) || typeof letra !== 'string') {
                return next(errorValidacion('Datos suministrados no válidos'));
            }

            try {
                const grupo = await getGrupoByCursoLetra(db, curso, letra); // Llama al servicio
                res.status(200).json(grupo);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        }
    };
}


/*export function gruposControllerFactory(db) {
    return {
        async getGrupoById(req, res, next) {
            const idGrupo = Number(req.params.idGrupo);
            if (!Number.isInteger(idGrupo)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            const transaction = await db.sequelize.transaction();
            try {
                const grupo = await getGrupoById(db, idGrupo); // Llama al servicio
                await transaction.commit();
                res.status(200).json(grupo);
            } catch (error) {
                await transaction.rollback();
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async getGrupoByCursoLetra(req, res, next) {
            const curso = Number(req.body.curso);
            const letra = req.body.letra;

            if (!Number.isInteger(curso) || typeof letra !== 'string') {
                return next(errorValidacion('Datos suministrados no válidos'));
            }

            const transaction = await db.sequelize.transaction();
            try {
                const grupo = await getGrupoByCursoLetra(db, curso, letra); // Llama al servicio
                await transaction.commit();
                res.status(200).json(grupo);
            } catch (error) {
                await transaction.rollback();
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        }
    };
}*/
