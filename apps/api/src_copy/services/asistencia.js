import { apiLogger } from '../../../../packages/logger/src/logger.js';
import { AppError, notFoundError, notExpectedError, validationError } from '../errors/errors.js';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';
/**
 * Registra una nueva asistencia en la base de datos.
 */
/*es seguimiento.js*/ 
/*export async function registroAsistencia(db, asistenciaData) {
    try {
        return await db.sequelize.models.Asistencia.create(asistenciaData);
    } catch (error) {
        apiLogger.error(`Error al registrar asistencia: ${error.message}`);
        throw notExpectedError({ cause: error });
    }
}*/

export async function registroAsistencia(db, asistenciaData) {
    try {
        return await db.sequelize.models.Asistencia.create(asistenciaData);
    } catch (error) {
        apiLogger.error(`Error al registrar asistencia: ${error.message}`);

        // Capturamos errores específicos de Sequelize para devolver un 400 en caso de validación incorrecta
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeForeignKeyConstraintError') {
            throw validationError(`Datos de asistencia no válidos: ${error.message}`);
        }

        throw notExpectedError({ cause: error });
    }
}

/**
 * Obtiene las asistencias filtradas por un criterio.
 */
export async function getAsistencias(db, filter) {
    try {
        // Construimos el rango de fechas si se proporcionan fechaInicio y fechaFin
        if (filter.fechaInicio && filter.fechaFin) {
            filter.fecha = {
                [Op.between]: [`${filter.fechaInicio} 00:00:00`, `${filter.fechaFin} 23:59:59`]
            };
            delete filter.fechaInicio;
            delete filter.fechaFin;
        } else if (filter.fecha) {
            // Si solo se proporciona una fecha específica, usamos el rango del día
            const startOfDay = `${filter.fecha} 00:00:00`;
            const endOfDay = `${filter.fecha} 23:59:59`;

            filter.fecha = {
                [Op.between]: [startOfDay, endOfDay]
            };
        }
        if (filter.espacio_id == -1) {
            delete filter.espacio_id;
        }

        apiLogger.info(`Obteniendo asistencias con filtro: ${JSON.stringify(filter)}`);
        const asistencias = await db.sequelize.models.Asistencia.findAll({
            attributes: ['id', 'docente_id', 'fecha', 'estado'], // Solo traemos los campos relevantes
            where: filter
        });

        return asistencias;
    } catch (error) {
        apiLogger.error(`Error al obtener asistencias: ${error.message}`);
        throw notExpectedError({ cause: error });
    }
}

export async function getAsistenciaById(db, idAsistencia) {
    // Buscamos la asistencia por ID
    const asistencia = await db.sequelize.models.Asistencia.findByPk(idAsistencia);

    // Si no encontramos la asistencia, lanzamos un error correctamente
    if (!asistencia) {
        throw notFoundError('Asistencia no encontrada');
    }

    return asistencia;
}


/*export async function updateAsistenciaById(db, idAsistencia, updates) {
    const asistencia = await db.sequelize.models.Asistencia.findByPk(idAsistencia);

    if (!asistencia) {
        notFoundError('Asistencia no encontrada');
    }

    Object.assign(asistencia, updates);

    try {
        await asistencia.save();
        return asistencia;
    } catch (error) {
        apiLogger.error(`Error al actualizar asistencia: ${error.message}`);
        throw notExpectedError({ cause: error });
    }
}*/

export async function updateAsistenciaById(db, idAsistencia, updates) {
    try {
        // Actualizamos la asistencia directamente en la base de datos
        const [updatedRows] = await db.sequelize.models.Asistencia.update(updates, {
            where: { id: idAsistencia }
        });

        // Si no se encontró la asistencia para actualizar, lanzamos un error
        if (updatedRows === 0) {
            throw notFoundError('Asistencia no encontrada');
        }

        // Retornamos la asistencia actualizada
        return await db.sequelize.models.Asistencia.findByPk(idAsistencia);
    } catch (error) {
        apiLogger.error(`Error al actualizar asistencia: ${error.message}`);
        throw notExpectedError({ cause: error });
    }
}

//todo
export async function getMacsBLE(db, params) {
    // Aquí se implementaría la lógica para obtener las MACs BLE
    // Esta es una base placeholder:
    const { espacioId, comienzo, fin } = params;

    // Validamos que los parámetros esenciales estén presentes
    if (!espacioId || !comienzo || !fin) {
        throw validationError('Faltan parámetros requeridos: espacioId, comienzo, fin');
    }

    apiLogger.info(`Obteniendo MACs BLE para espacioId: ${espacioId}`);
    
    return []; // Simulación, deberías reemplazar con lógica real
}
