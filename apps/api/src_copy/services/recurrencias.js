import { apiLogger } from '../../../../packages/logger/src/logger.js';
import { notFoundError } from '../errors/errors.js';

export async function getRecurrenciaById(db, idRecurrencia) {
    apiLogger.info(`Fetching recurrencia with id ${idRecurrencia}`);
    const recurrencia = await db.sequelize.models.Recurrencia.findOne({
        attributes: [
            'tipo_recurrencia',
            'separacion',
            'maximo',
            'dia_semana',
            'semana_mes',
            'dia_mes',
            'mes_anio'
        ],
        where: { id: idRecurrencia }
    });

    if (!recurrencia) {
        throw notFoundError('Recurrencia no encontrada');
    }

    return recurrencia.dataValues;
}

export async function getRecurrenciaByActividad(db, idActividad) {
    apiLogger.info(`Fetching recurrencias for actividad with id ${idActividad}`);
    const actividad = await db.sequelize.models.Actividad.findOne({ where: { id: idActividad } });

    if (!actividad) {
        throw notFoundError('Actividad no encontrada');
    }

    const recurrencias = await db.sequelize.models.Recurrencia.findAll({
        attributes: ['id'],
        include: {
            model: db.sequelize.models.Actividad,
            as: 'recurrencia_de',
            where: { id: idActividad }
        }
    });

    return { recurrencias: recurrencias.map((rec) => ({ id: rec.dataValues.id })) };
}
