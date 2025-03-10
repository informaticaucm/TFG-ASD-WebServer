import { getRecurrenciaById, getRecurrenciaByActividad } from '../services/recurrencias.js';
import { AppError, validationError, notExpectedError } from '../errors/errors.js';

export function recurrenciaControllerFactory(db) {
    return {
        async getRecurrenciaById(req, res, next) {
            // Convertimos el parámetro a número y validamos si es un entero válido
            const idRecurrencia = Number(req.params.idRecurrencia);
            if (!Number.isInteger(idRecurrencia)) {
                return next(validationError('Id suministrado no válido'));
            }

            try {
                // Llamamos al servicio para obtener la recurrencia
                const recurrencia = await getRecurrenciaById(db, idRecurrencia);
                res.status(200).json(recurrencia);
            } catch (error) {
                // Capturamos el error y lo manejamos de manera uniforme
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        },
        async getRecurrenciaByActividad(req, res, next) {
            // Convertimos el parámetro a número y validamos si es un entero válido
            const idActividad = Number(req.params.idActividad);
            if (!Number.isInteger(idActividad)) {
                return next(validationError('Id suministrado no válido'));
            }

            try {
                // Llamamos al servicio para obtener las recurrencias de la actividad
                const recurrencias = await getRecurrenciaByActividad(db, idActividad);
                res.status(200).json(recurrencias);
            } catch (error) {
                // Capturamos el error y lo manejamos de manera uniforme
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        }
    };
}


