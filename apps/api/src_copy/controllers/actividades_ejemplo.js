// controllers/actividadesController.js
import { getActividadesOfUsuario } from '../services/actividades.js';
import { AppError, errorValidacion, notExpectedError } from '../utils/errors.js';

export function actividadesUsuarioControllerFactory(db) {
    return async (req, res, next) => {
        let idUsuario = Number(req.params.idUsuario);
        if (!Number.isInteger(idUsuario)) {
            return next(errorValidacion('Id suministrado no válido'));
        }
        
        const transaction = await db.sequelize.transaction();
        
        try {
            const actividades = await getActividadesOfUsuario(db, idUsuario);  // Llamada al servicio
            await transaction.commit();

            const respuesta = { actividades };
            res.status(200).json(respuesta);  // Enviar respuesta en formato JSON
        } catch (error) {
            await transaction.rollback();
            let err = error;
            if (!(error instanceof AppError)) {
                err = notExpectedError({ cause: error });
            }
            next(err);  // Manejo del error
        }
    }
}
