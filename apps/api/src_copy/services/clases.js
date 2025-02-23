import { notFoundError, notExpectedError } from '../utils/errors.js';
import { apiLogger } from '../config/logger.js';
// clase.service.js

/*export async function getClaseById(db, idClase) {
    const transaction = await db.sequelize.transaction();

    try {
        const query_cla = await db.sequelize.models.Clase.findOne({
            attributes: ['asignatura_id', 'grupo_id'],
            where: { id: idClase }
        });

        if (!query_cla) {
            await transaction.rollback();
            throw new Error('Clase no encontrada');
        }

        return query_cla.dataValues;
    } catch (error) {
        await transaction.rollback();
        throw new Error(`Error while interacting with database: ${error.message}`);
    } finally {
        await transaction.commit();
    }
}*/


/**
 * Obtiene una clase por su ID.
 */
export async function getClaseById(db, idClase) {
    try {
        // Buscamos la clase por ID
        const clase = await db.sequelize.models.Clase.findOne({
            attributes: ['asignatura_id', 'grupo_id'],
            where: { id: idClase }
        });

        // Si no se encuentra la clase, lanzamos error
        if (!clase) {
            throw notFoundError('Clase no encontrada');
        }

        return clase.dataValues;
    } catch (error) {
        apiLogger.error(`Error al obtener clase por ID: ${error.message}`);
        throw notExpectedError({ cause: error });
    }
}

/**
 * Obtiene la clase de una asignatura y grupo específicos.
 */
export async function getClaseOfAsignaturaGrupo(db, asignatura_id, grupo_id) {
    try {
        // Verificamos si la asignatura existe
        const asignatura = await db.sequelize.models.Asignatura.findOne({
            attributes: ['id'],
            where: { id: asignatura_id }
        });

        if (!asignatura) {
            throw notFoundError(`Asignatura con ID ${asignatura_id} no encontrada`);
        }

        // Verificamos si el grupo existe
        const grupo = await db.sequelize.models.Grupo.findOne({
            attributes: ['id'],
            where: { id: grupo_id }
        });

        if (!grupo) {
            throw notFoundError(`Grupo con ID ${grupo_id} no encontrado`);
        }

        // Ahora buscamos la clase en base a la asignatura y grupo
        const clase = await db.sequelize.models.Clase.findOne({
            attributes: ['id'],
            where: { asignatura_id, grupo_id }
        });

        if (!clase) {
            throw notFoundError(`No se encontró una clase para la asignatura ${asignatura_id} y el grupo ${grupo_id}`);
        }

        return { id: clase.id };
    } catch (error) {
        apiLogger.error(`Error al obtener clase de asignatura y grupo: ${error.message}`);
        throw notExpectedError({ cause: error });
    }
}
