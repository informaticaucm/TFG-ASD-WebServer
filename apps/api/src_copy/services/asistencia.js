import { apiLogger } from '../config/logger.js';
import { AppError, notFoundError, notExpectedError } from '../utils/errors.js';

/*es seguimiento.js*/ 
export async function registroAsistencia(db, asistenciaData) {
    try {
        return await db.sequelize.models.Asistencia.create(asistenciaData);
    } catch (error) {
        apiLogger.error(`Error al registrar asistencia: ${error.message}`);
        throw notExpectedError({ cause: error });
    }
}

export async function getAsistencias(db, filter) {
    try {
        const asistencias = await db.sequelize.models.Asistencia.findAll({
            where: filter
        });
        return asistencias;
    } catch (error) {
        apiLogger.error(`Error al obtener asistencias: ${error.message}`);
        throw notExpectedError({ cause: error });
    }
}

export async function getAsistenciaById(db, idAsistencia) {
    const asistencia = await db.sequelize.models.Asistencia.findByPk(idAsistencia);

    if (!asistencia) {
        notFoundError('Asistencia no encontrada');
    }

    return asistencia;
}

export async function updateAsistenciaById(db, idAsistencia, updates) {
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
}

export async function getMacsBLE(db, params) {
    // Aquí se implementaría la lógica para obtener las MACs BLE
    // Esta es una base placeholder:
    const { espacioId, comienzo, fin } = params;

    apiLogger.info(`Obteniendo MACs BLE para espacioId: ${espacioId}`);
    
    return []; // Simulación, deberías reemplazar con lógica real
}
