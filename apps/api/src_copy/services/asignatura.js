import { apiLogger } from '../../../../packages/logger/src/logger.js';  // Asumimos que tienes un logger configurado
import { AppError, notFoundError } from '../errors/errors.js';

export async function getAsignaturaById(db, idAsignatura) {
    // Buscamos la asignatura por ID
    const asignatura = await db.sequelize.models.Asignatura.findOne({
        attributes: ['nombre', 'siglas', 'departamento', 'periodo'],
        where: { id: idAsignatura }
    });

    // Si no encontramos la asignatura, lanzamos un error.
    if (!asignatura) {
        //console.log("ERROR")
        throw notFoundError('Asignatura no encontrada');
        //{ status: 404, message: 'Asignatura no encontrada' }
    }

    // Retornamos directamente la asignatura sin modificaciones
    return asignatura;
}

