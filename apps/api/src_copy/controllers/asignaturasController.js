import { getAsignaturaById } from '../services/asignaturas.js'; // Servicio con la lógica
import { errorValidacion, notExpectedError } from '../utils/errors.js';

export function asignaturaControllerFactory(db) {
    return {
        async getAsignaturaById(req, res, next) {
            let idAsignatura = Number(req.params.idAsignatura);
            
            if (!Number.isInteger(idAsignatura)) {
                return next(errorValidacion('Id suministrado no válido'));
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

