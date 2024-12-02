
import { generateQR } from '../services/qrs.js';
import { AppError, errorValidacion, notExpectedError } from '../utils/errors.js';

export function qrsControllerFactory(db) {
    return {
        async generateQR(req, res, next) {
            const idEspacio = Number(req.params.idEspacio);
            if (!Number.isInteger(idEspacio)) {
                return next(errorValidacion('Id suministrado no válido'));
            }

            try {
                const result = await generateQR(req, idEspacio, db); // Llama al servicio
                res.setHeader('Content-Type', 'image/png');
                res.status(200).sendFile(result.filePath); // Envía la imagen generada
            } catch (error) {
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        }
    };
}
