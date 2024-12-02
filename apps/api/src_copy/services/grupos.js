// services/grupos.js
import { apiLogger } from '../config/logger.js'; // Configuración del logger
import { notFoundError } from '../utils/errors.js';


export async function getGrupoById(db, idGrupo) {
    apiLogger.info(`Fetching grupo with id ${idGrupo}`);
    const grupo = await db.sequelize.models.Grupo.findOne({
        attributes: ['curso', 'letra'],
        where: { id: idGrupo }
    });

    if (!grupo || Object.keys(grupo.dataValues).length === 0) {
        throw notFoundError('Grupo no encontrado');
    }

    return grupo.dataValues;
}

/**
 * Obtiene un grupo por curso y letra.
 */
export async function getGrupoByCursoLetra(db, curso, letra) {
    apiLogger.info(`Fetching grupo with curso ${curso} and letra ${letra}`);
    const grupo = await db.sequelize.models.Grupo.findOne({
        attributes: ['id'],
        where: { curso, letra }
    });

    if (!grupo || Object.keys(grupo.dataValues).length === 0) {
        throw notFoundError('Grupo no encontrado');
    }

    return grupo.dataValues;
}
