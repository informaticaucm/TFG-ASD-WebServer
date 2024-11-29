// controllers/actividadesController.js
import {
    getActividadesOfUsuario,
    getActividadesOfEspacio,
    getActividadesOfClase,
    getActividadById
} from '../services/actividades.js';
import { AppError, errorValidacion, notExpectedError } from '../utils/errors.js';

export function actividadesControllerFactory(db) {
    return {
        async getActividadesOfUsuario(req, res, next) {
            let idUsuario = Number(req.params.idUsuario);
            if (!Number.isInteger(idUsuario)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            const transaction = await db.sequelize.transaction();

            try {
                const actividades = await getActividadesOfUsuario(db, idUsuario);
                await transaction.commit();

                const respuesta = { actividades };
                res.status(200).json(respuesta);
            } catch (error) {
                await transaction.rollback();
                let err = error;
                if (!(error instanceof AppError)) {
                    err = notExpectedError({ cause: error });
                }
                next(err);
            }
        },

        async getActividadesOfEspacio(req, res, next) {
            let idEspacio = Number(req.params.idEspacio);
            if (!Number.isInteger(idEspacio)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            const transaction = await db.sequelize.transaction();

            try {
                const actividades = await getActividadesOfEspacio(db, idEspacio);
                await transaction.commit();

                const respuesta = { actividades };
                res.status(200).json(respuesta);
            } catch (error) {
                await transaction.rollback();
                let err = error;
                if (!(error instanceof AppError)) {
                    err = notExpectedError({ cause: error });
                }
                next(err);
            }
        },

        async getActividadesOfClase(req, res, next) {
            let idClase = Number(req.params.idClase);
            if (!Number.isInteger(idClase)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            const transaction = await db.sequelize.transaction();

            try {
                const actividades = await getActividadesOfClase(db, idClase);
                await transaction.commit();

                const respuesta = { actividades };
                res.status(200).json(respuesta);
            } catch (error) {
                await transaction.rollback();
                let err = error;
                if (!(error instanceof AppError)) {
                    err = notExpectedError({ cause: error });
                }
                next(err);
            }
        },

        async getActividadById(req, res, next) {
            let idActividad = Number(req.params.idActividad);
            if (!Number.isInteger(idActividad)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            const transaction = await db.sequelize.transaction();

            try {
                const actividad = await getActividadById(db, idActividad);
                await transaction.commit();

                res.status(200).json(actividad);
            } catch (error) {
                await transaction.rollback();
                let err = error;
                if (!(error instanceof AppError)) {
                    err = notExpectedError({ cause: error });
                }
                next(err);
            }
        }
    };
}
