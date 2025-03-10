import { getAsignaturaById } from '../services/asignatura.js'; // Servicio con la lógica
import { validationError, notExpectedError } from '../errors/errors.js';

export function asignaturaControllerFactory(db) {
    return {
        async getAsignaturaById(req, res, next) {
            let idAsignatura = Number(req.params.idAsignatura);
            
            if (!Number.isInteger(idAsignatura)) {
                return next(validationError('Id suministrado no válido'));
            }

            try {
                // Llamada al servicio sin transacción (solo lectura)
                const asignatura = await getAsignaturaById(db, idAsignatura);
                res.status(200).json(asignatura);
            } catch (error) {
                next(notExpectedError({ cause: error })); // Manejo uniforme de errores
            }
        }
    };
}

