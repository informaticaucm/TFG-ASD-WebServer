import { getAsignaturaById } from '../services/asignaturas.js'; // Servicio con la lógica

export function asignaturaControllerFactory(db) {
    return async (req, res, next) => {
        let idAsignatura = Number(req.params.idAsignatura);
        
        if (!Number.isInteger(idAsignatura)) {
            return next({
                status: 400,
                message: 'Id suministrado no válido'
            });
        }

        const transaction = await db.sequelize.transaction();
        
        try {
            // Llamada al servicio
            const asignatura = await getAsignaturaById(db, idAsignatura);
            await transaction.commit();

            res.status(200).json(asignatura); // Devolvemos la respuesta en formato JSON
        } catch (error) {
            await transaction.rollback();
            next(error); // Propagamos el error
        }
    };
}
