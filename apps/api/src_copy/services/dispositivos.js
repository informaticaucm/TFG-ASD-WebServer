import { authenticator } from 'otplib';
import moment from 'moment';
import { apiLogger } from '../config/logger.js';
import { notFoundError, notExpectedError } from '../utils/errors.js';

/*export async function getAllDispositivos(db) {
    apiLogger.info('Searching in Dispositivo for id, nombre, espacioId, idExternoDispositivo');
    const query = await db.sequelize.models.Dispositivo.findAll({
        attributes: ['id', 'nombre', 'espacioId', 'idExternoDispositivo'],
    });

    return query.map(disp => disp.dataValues);
}*/

/**
 * Obtiene todos los dispositivos registrados.
 */
export async function getAllDispositivos(db) {
    apiLogger.info('Buscando todos los dispositivos con id, nombre, espacioId, idExternoDispositivo');
    return await db.sequelize.models.Dispositivo.findAll({
        attributes: ['id', 'nombre', 'espacioId', 'idExternoDispositivo'],
    });
}

/*export async function createDispositivo(body, db, api_config) {
    const transaction = await db.sequelize.transaction();
    try {
        const port_spec = api_config.port_spec ? ':' + api_config.port : '';
        const endpointSeguimiento = `${api_config.protocol}://${api_config.host}${port_spec}${api_config.path}/seguimiento`;
        const dispSecret = authenticator.generateSecret();

        const [disp, created] = await db.sequelize.models.Dispositivo.findOrCreate({
            where: { nombre: body.nombre, espacioId: body.espacioId },
            defaults: {
                nombre: body.nombre,
                espacioId: body.espacioId,
                idExternoDispositivo: body.idExternoDispositivo,
                creadoPor: 1,
                actualizadoPor: 1,
                endpointSeguimiento,
                t0: 0,
                secret: dispSecret,
            },
        });

        if (!created && body.idExternoDispositivo !== disp.dataValues.idExternoDispositivo) {
            await db.sequelize.models.Dispositivo.update(
                { idExternoDispositivo: body.idExternoDispositivo },
                { where: { id: disp.dataValues.id } }
            );
        }

        await transaction.commit();

        return {
            id: disp.id,
            nombre: body.nombre,
            espacioId: body.espacioId,
            idExternoDispositivo: body.idExternoDispositivo,
            creadoEn: disp.creadoEn,
            creadoPor: disp.creadoPor,
            actualizadoEn: disp.actualizadoEn,
            actualizadoPor: disp.actualizadoPor,
            endpointSeguimiento,
            totpConfig: { t0: 0, secret: disp.secret },
            epoch: moment.unix(),
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}*/

/**
 * Crea un nuevo dispositivo o actualiza el idExternoDispositivo si ya existe.
 */
export async function createDispositivo(body, db, api_config) {
    try {
        const port_spec = api_config.port_spec ? `:${api_config.port}` : '';
        const endpointSeguimiento = `${api_config.protocol}://${api_config.host}${port_spec}${api_config.path}/seguimiento`;
        const dispSecret = authenticator.generateSecret();

        // Usamos `findOrCreate` con `updateOnDuplicate` para evitar una actualización manual posterior
        const [disp, created] = await db.sequelize.models.Dispositivo.findOrCreate({
            where: { nombre: body.nombre, espacioId: body.espacioId },
            defaults: {
                nombre: body.nombre,
                espacioId: body.espacioId,
                idExternoDispositivo: body.idExternoDispositivo,
                creadoPor: 1,
                actualizadoPor: 1,
                endpointSeguimiento,
                t0: 0,
                secret: dispSecret,
            },
            updateOnDuplicate: ['idExternoDispositivo'] // Si ya existe, actualiza solo este campo
        });

        return {
            id: disp.id,
            nombre: disp.nombre,
            espacioId: disp.espacioId,
            idExternoDispositivo: disp.idExternoDispositivo,
            creadoEn: disp.creadoEn,
            creadoPor: disp.creadoPor,
            actualizadoEn: disp.actualizadoEn,
            actualizadoPor: disp.actualizadoPor,
            endpointSeguimiento,
            totpConfig: { t0: 0, secret: disp.secret },
            epoch: moment.unix(),
        };
    } catch (error) {
        apiLogger.error(`Error al crear dispositivo: ${error.message}`);
        throw notExpectedError({ cause: error });
    }
}

/**
 * Busca un dispositivo por su ID.
 */
export async function findDispositivoById(idDispositivo, db) {
    apiLogger.info('Buscando dispositivo por ID');

    const dispositivo = await db.sequelize.models.Dispositivo.findOne({
        where: { id: idDispositivo },
    });

    if (!dispositivo) {
        throw notFoundError(`Dispositivo con ID ${idDispositivo} no encontrado`);
    }

    return dispositivo;
}

/*export async function removeDispositivo(idDispositivo, db) {
    const transaction = await db.sequelize.transaction();
    try {
        const query = await db.sequelize.models.Dispositivo.findOne({
            attributes: ['id'],
            where: { id: idDispositivo },
        });

        if (!query) {
            await transaction.rollback();
            return false;
        }

        await db.sequelize.models.Dispositivo.destroy({ where: { id: query.dataValues.id } });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}*/

/*export async function removeDispositivo(idDispositivo, db) {
    try {
        // Eliminamos el dispositivo y verificamos cuántas filas fueron afectadas
        const deletedRows = await db.sequelize.models.Dispositivo.destroy({
            where: { id: idDispositivo },
        });

        if (deletedRows === 0) {
            throw notFoundError(`Dispositivo con ID ${idDispositivo} no encontrado`);
        }

        return true;
    } catch (error) {
        apiLogger.error(`Error al eliminar dispositivo: ${error.message}`);
        throw notExpectedError({ cause: error });
    }
}*/

/**
 * Elimina un dispositivo si existe.
 */
export async function removeDispositivo(idDispositivo, db) {
    try {
        // Eliminamos el dispositivo y verificamos cuántas filas fueron afectadas
        const deletedRows = await db.sequelize.models.Dispositivo.destroy({
            where: { id: idDispositivo },
        });

        if (deletedRows === 0) {
            throw notFoundError(`Dispositivo con ID ${idDispositivo} no encontrado`);
        }

        return true;
    } catch (error) {
        apiLogger.error(`Error al eliminar dispositivo: ${error.message}`);
        throw notExpectedError({ cause: error });
    }
}

/**
 * Obtiene la época actual en segundos.
 */
export function getCurrentEpoch() {
    return { epoch: Math.floor(new Date().getTime() / 1000) };
}
