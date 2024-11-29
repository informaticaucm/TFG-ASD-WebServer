// controllers/espaciosController.js
import {
    getEspacios as fetchEspacios,
    getEspacioById as fetchEspacioById,
    getEspaciosOfUsuario as fetchEspaciosOfUsuario,
    getEspacioOfActividad as fetchEspacioOfActividad
} from '../services/espacios.js';
import { AppError, errorValidacion, notExpectedError } from '../utils/errors.js';

export function espaciosControllerFactory(db) {
    return {
        async getEspacios(req, res, next) {
            const transaction = await db.sequelize.transaction();
            try {
                const espacios = await fetchEspacios(db); // Llama al servicio
                await transaction.commit();
                res.status(200).json(espacios);
            } catch (error) {
                await transaction.rollback();
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async getEspacioById(req, res, next) {
            const idEspacio = Number(req.params.idEspacio);
            if (!Number.isInteger(idEspacio)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            const transaction = await db.sequelize.transaction();
            try {
                const espacio = await fetchEspacioById(db, idEspacio);
                await transaction.commit();
                res.status(200).json(espacio);
            } catch (error) {
                await transaction.rollback();
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async getEspaciosOfUsuario(req, res, next) {
            const idUsuario = Number(req.params.idUsuario);
            if (!Number.isInteger(idUsuario)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            const transaction = await db.sequelize.transaction();
            try {
                const espacios = await fetchEspaciosOfUsuario(db, idUsuario, req.body.opcion);
                await transaction.commit();
                res.status(200).json(espacios);
            } catch (error) {
                await transaction.rollback();
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async getEspacioOfActividad(req, res, next) {
            const idActividad = Number(req.params.idActividad);
            if (!Number.isInteger(idActividad)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            const transaction = await db.sequelize.transaction();
            try {
                const espacio = await fetchEspacioOfActividad(db, idActividad);
                await transaction.commit();
                res.status(200).json(espacio);
            } catch (error) {
                await transaction.rollback();
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        }
    };
}
