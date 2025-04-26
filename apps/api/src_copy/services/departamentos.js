// services/grupos.js
import { apiLogger } from '../../../../packages/logger/src/logger.js'; // Configuración del logger
import { notFoundError } from '../errors/errors.js';

function mapDepartamentos(query) {
    return query.map((dep) => ({
        id: dep.dataValues.id,
        nombre: dep.dataValues.nombre
    }));
}


export async function getDepartamentos(db) {
    apiLogger.info(`Fetching all departaments`);
    const departamentos = await db.sequelize.models.Departamento.findAll({
        attributes: ['nombre']
    });

    if (!departamentos || Object.keys(departamentos).length === 0) {
        throw notFoundError('departamentos no encontrados');
    }

    return mapDepartamentos(departamentos);
}