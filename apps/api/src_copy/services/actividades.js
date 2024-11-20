// services/actividades.js
import { apiLogger } from '../config/logger.js';  // Asumimos que tienes un logger configurado
import { AppError, notFoundError } from '../utils/errors.js';

export async function getActividadesOfUsuario(db, idUsuario) {
    const query_doc = await db.sequelize.models.Docente.findOne({
        attributes: ['id'],
        where: { id: idUsuario }
    });

    if (query_doc == null || Object.keys(query_doc.dataValues).length === 0) {
        notFoundError('Usuario no encontrado');
    }

    const actividades = [];
    
    apiLogger.info('Searching in Actividad impartida por Docente for actividad_id');
    const query_r = await db.sequelize.models.Actividad.findAll({
        attributes: ['id'],
        include: {
            model: db.sequelize.models.Docente,
            as: 'impartida_por',
            where: { id: idUsuario }
        }
    });
    
    // Si tiene actividades, las agregamos
    if (query_r.length !== 0) {
        query_r.forEach((act) => {
            actividades.push({ id: act.dataValues.id });
        });
    }

    return actividades;  // Retornar las actividades encontradas
}
