import { getRecurrenciaById, getRecurrenciaByActividad } from '../services/recurrencias.js';
import { AppError, errorValidacion, notExpectedError } from '../utils/errors.js';

export function recurrenciaControllerFactory(db) {
    return {
        async getRecurrenciaById(req, res, next) {
            const idRecurrencia = Number(req.params.idRecurrencia);
            if (!Number.isInteger(idRecurrencia)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            const transaction = await db.sequelize.transaction();
            try {
                const recurrencia = await getRecurrenciaById(db, idRecurrencia); // Llama al servicio
                await transaction.commit();
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json(recurrencia);
            } catch (error) {
                await transaction.rollback();
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async getRecurrenciaByActividad(req, res, next) {
            const idActividad = Number(req.params.idActividad);
            if (!Number.isInteger(idActividad)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            const transaction = await db.sequelize.transaction();
            try {
                const recurrencias = await getRecurrenciaByActividad(db, idActividad); // Llama al servicio
                await transaction.commit();
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json(recurrencias);
            } catch (error) {
                await transaction.rollback();
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        }
    };
}
