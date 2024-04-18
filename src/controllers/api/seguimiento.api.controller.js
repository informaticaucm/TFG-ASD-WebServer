const logger = require('../../config/logger.config').child({"process": "api"});

const { Op } = require("sequelize");
const { authenticator } = require('otplib');
const moment = require('moment');
const recurrence_tool = require('../../utils/recurrence_tool');

const valoresAsistencia = ['Asistida', 'Asistida con Irregularidad', 'No Asistida'];

async function registroAsistencia(req, res, db) {

    logger.info(`Asistencia a registrar con datos: ${JSON.stringify(req.body)}`);

    if (Object.keys(req.body).length > 0 && req.body.tipo_registro != null && req.body.espacioId != null && Number.isInteger(req.body.espacioId)) {

        let code = 0;
        switch (req.body.tipo_registro) {
            case "RegistroSeguimientoFormulario": // Método de registro para administración (registrar firmas)
                if (req.body.usuarioId != null && Number.isInteger(req.body.usuarioId) && req.body.estado != null && valoresAsistencia.includes(req.body.estado)) {

                    const transaction = await db.sequelize.transaction();

                    try {
                        logger.info('Searching in Docente for id');
                        const query_user = await db.sequelize.models.Docente.findOne({
                            attributes: ['id'],
                            where: {
                                id: req.body.usuarioId
                            }
                        })
                        
                        if (query_user == null || Object.keys(query_user.dataValues).length == 0) {
                            res.status(404).send('Usuario no encontrado');
                            await transaction.rollback();
                            return;
                        }
                        
                        (req.body.estado == valoresAsistencia[0]) ? code = 1 : code = 2

                        await db.sequelize.models.Asistencia.create({ 
                            docente_id: req.body.usuarioId, 
                            espacio_id: req.body.espacioId, 
                            fecha: req.body.fecha || db.sequelize.fn('NOW'), 
                            estado: req.body.estado,
                            motivo: req.body.motivo || null
                        });

                        await transaction.commit();
                    }
                    catch (error) {
                        logger.error(`Error while interacting with database: ${error}`);
                        res.status(500).send('Something went wrong');
                        await transaction.rollback();
                        return;
                    }
                }
                else {
                    res.status(422).send('Datos no válidos');
                    return;
                }
            break;
            case "RegistroSeguimientoUsuario": // Método registro a través del formulario (es necesario el totp)
                if (req.body.usuarioId != null && Number.isInteger(req.body.usuarioId)) {

                    const transaction = await db.sequelize.transaction();

                    try {
                        logger.info('Searching in Dispositivo for id');
                        const query_disp = await db.sequelize.models.Dispositivo.findAll({ // Si hay más de un dispositivo por espacio habría que comprobar todos
                            attributes: ['id', 'secret'],
                            where: {
                                espacioId: req.body.espacioId
                            }
                        });

                        if (query_disp.length == 0) {
                            res.status(404).send('Dispositivo no encontrado');
                            await transaction.rollback();
                            return;
                        }

                        logger.info('Searching in Docente for id');
                        const query_user = await db.sequelize.models.Docente.findOne({
                            attributes: ['id'],
                            where: {
                                id: req.body.usuarioId
                            }
                        })
                        
                        if (query_user == null || Object.keys(query_user.dataValues).length == 0) {
                            res.status(404).send('Usuario no encontrado');
                            await transaction.rollback();
                            return;
                        }

                        let valid = false;
                        authenticator.options = { digits: 6, step: 60, window: [10, 0] };
                        query_disp.forEach(async (disp) => {
                            if (authenticator.verify({token: req.body.totp, secret: disp.dataValues.secret})) {
                                valid = true;
                            }
                        });

                        if (!valid) {
                            res.status(422).send('Datos no válidos');
                            await transaction.rollback();
                            return;
                        }

                        (req.body.estado == valoresAsistencia[0]) ? code = 1 : code = 2

                        await db.sequelize.models.Asistencia.create({ 
                            docente_id: req.body.usuarioId, 
                            espacio_id: req.body.espacioId, 
                            fecha: db.sequelize.fn('NOW'), 
                            estado: req.body.estado
                        });

                        await transaction.commit();
                    }
                    catch (error) {
                        logger.error(`Error while interacting with database: ${error}`);
                        res.status(500).send('Something went wrong');
                        await transaction.rollback();
                        return;
                    }
                }
                else {
                    res.status(422).send('Datos no válidos');
                    return;
                }
            break;
            case "RegistroSeguimientoDispositivoBle": // caso de registro por bluetooth
                if (req.body.mac != null && req.body.dispositivoId != null && Number.isInteger(req.body.dispositivoId)) {

                    const transaction = await db.sequelize.transaction();

                    try {
                        logger.info('Searching in Dispositivo for id');
                        const query_disp = await db.sequelize.models.Dispositivo.findOne({ // Si hay más de un dispositivo habría que comprobar todos
                            attributes: ['id', 'secret'],
                            where: {
                                espacioId: req.body.espacioId
                            }
                        });
                                
                        if (query_disp == null || Object.keys(query_disp.dataValues).length == 0) {
                            res.status(404).send('Dispositivo no encontrado');
                            await transaction.rollback();
                            return;
                        }

                        logger.info('Searching in Docente for id');
                        const query_user = await db.sequelize.models.Docente.findOne({
                            attributes: ['id'],
                            include: {
                                model: db.sequelize.models.Macs,
                                as: 'con_mac',
                                where: {
                                    mac: req.body.mac
                                }
                            }
                        });
                        
                        if (query_user == null || Object.keys(query_user.dataValues).length == 0) {
                            res.status(404).send('Usuario no encontrado');
                            await transaction.rollback();
                            return;
                        }

                        logger.info(`Docente de la MAC ${query_user}`);

                        let checkEstado = await checkEstadoAsistencia(db, res, query_user.dataValues.id, req.body.espacioId);
                        (checkEstado) ? code = 1 : code = 2

                        let ahora = moment().utc()

                        await db.sequelize.models.Asistencia.findOrCreate({
                            where: {
                                docente_id: query_user.dataValues.id, 
                                espacio_id: req.body.espacioId,
                                estado: {
                                    [Op.or]: [valoresAsistencia[0], valoresAsistencia[1]]
                                },
                                fecha: { [Op.and]: [{ [Op.gte]: ahora.clone().subtract(20, 'minutes') }, { [Op.lte]: ahora }]}
                            }, 
                            order: [['creadoEn', 'DESC']],
                            defaults: {
                                docente_id: query_user.dataValues.id, 
                                espacio_id: req.body.espacioId, 
                                fecha: db.sequelize.fn('NOW'), 
                                estado: (checkEstado) ? valoresAsistencia[0] : valoresAsistencia[1]
                            }
                        });

                        await transaction.commit();
                    }
                    catch (error) {
                        logger.error(`Error while interacting with database: ${error}`);
                        res.status(500).send('Something went wrong');
                        await transaction.rollback();
                        return;
                    }
                }
                else {
                    res.status(422).send('Datos no válidos');
                    return;
                }
            break;
            case "RegistroSeguimientoDispositivoNFC": // caso de registro por lectura de nfc
                if (req.body.uid != null) {

                    const transaction = await db.sequelize.transaction();

                    try {
                        logger.info('Searching in Dispositivo for id');
                        const query_disp = await db.sequelize.models.Dispositivo.findAll({ // Si hay más de un dispositivo habría que comprobar todos
                            attributes: ['id', 'secret'],
                            where: {
                                espacioId: req.body.espacioId
                            }
                        });

                        if (query_disp.length == 0) {
                            res.status(404).send('Dispositivo no encontrado');
                            await transaction.rollback();
                            return;
                        }

                        logger.info('Searching in Docente for id');
                        const query_user = await db.sequelize.models.Docente.findOne({
                            attributes: ['id'],
                            include: {
                                model: db.sequelize.models.Nfcs,
                                as: 'con_nfc',
                                where: {
                                    nfc: parseInt(req.body.uid)
                                }
                            }
                        });
                        
                        if (query_user == null || Object.keys(query_user.dataValues).length == 0) {
                            res.status(404).send('Usuario no encontrado');
                            await transaction.rollback();
                            return;
                        }
                        
                        let checkEstado = await checkEstadoAsistencia(db, res, query_user.dataValues.id, req.body.espacioId);
                        (checkEstado) ? code = 1 : code = 2

                        await db.sequelize.models.Asistencia.create({ 
                            docente_id: query_user.dataValues.id, 
                            espacio_id: req.body.espacioId, 
                            fecha: db.sequelize.fn('NOW'), 
                            estado: (checkEstado) ? valoresAsistencia[0] : valoresAsistencia[1]
                        });

                        await transaction.commit();
                    }
                    catch (error) {
                        logger.error(`Error while interacting with database: ${error}`);
                        res.status(500).send('Something went wrong');
                        await transaction.rollback();
                        return;
                    }
                }
                else {
                    res.status(422).send('Datos no válidos');
                    return;
                }
            break;
        }
     
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send({ feedback_code: code});
        //res.status(200).send({ resultado: 'correcto' });
    }
    else {
        res.status(422).send('Datos no válidos');
        return;
    }    
}

async function getMacsBLE(req, res, db) {
    if (Object.keys(req.body).length > 0 && req.body.espacioId != null) {
        try {
            espId = parseInt(req.body.espacioId);
        }
        catch {
            res.status(400).send("Id suministrado no válido");
            return;
        }

        const comienzo = (req.body.comienzo == null)? moment().subtract(30, 'minutes').utc() : moment(req.body.comienzo, 'HH:mmZ').utc();
        const fin = (req.body.fin == null)? moment().add(30, 'minutes').utc() : moment(req.body.fin, 'HH:mmZ').utc();

        const transaction = await db.sequelize.transaction();
        
        try {
            logger.info('Searching in Espacio for id');
            const query_esp = await db.sequelize.models.Espacio.findOne({
                attributes:['id'],
                where: {
                    id: espId
                }
            });

            // Comprobamos que el espacio exista en la base de datos
            if (query_esp == null || Object.keys(query_esp.dataValues).length == 0) {
                res.status(404).send('Espacio no encontrado');
                await transaction.rollback();
                return;
            }
        
            let respuesta = { macs: [] };
            let actividades = []
        
            logger.info('Searching in Actividad for id');
            const query_act = await db.sequelize.models.Actividad.findAll({
                attributes:['id', 'tiempo_inicio', 'tiempo_fin', 'es_recurrente'],
                include: {
                    model: db.sequelize.models.Espacio,
                    as: 'impartida_en',
                    where: {
                        id: espId
                    }
                }
            });
                
            // Si tiene actividades
            if (query_act.length != 0) {
                let ahora = moment().utc();
                for (let i = 0; i < query_act.length; i++) {
                    let act = query_act[i];
                    if ((moment(act.dataValues.tiempo_inicio, 'HH:mm').utc().format('HH:mm') <= comienzo.format('HH:mm') 
                        && moment(act.dataValues.tiempo_fin, 'HH:mm').utc().format('HH:mm')  >= comienzo.format('HH:mm')) 
                        || (moment(act.dataValues.tiempo_inicio, 'HH:mm').utc().format('HH:mm') <= fin.format('HH:mm') 
                        && moment(act.dataValues.tiempo_fin, 'HH:mm').utc().format('HH:mm')  >= fin.format('HH:mm'))) {
                            
                        let cancelada = false;
                        
                        const excepciones_act = await db.sequelize.models.Excepcion.findAll({
                            attributes: ['fecha_inicio_act'],
                            where: {
                                actividad_id: act.dataValues.id,
                                esta_cancelado: 'Sí'
                            }
                        });

                        excepciones_act.forEach(ex => {
                            if (moment(ex.dataValues.fecha_inicio_act).format('YYYY-MM-DD') == ahora.format('YYYY-MM-DD')) {
                                cancelada = true;
                            }
                        });

                        
                        if (act.dataValues.es_recurrente == 'Sí') {

                            const recurrencias = await db.sequelize.models.Recurrencia.findAll({
                                where: {
                                    actividad_id: act.dataValues.id
                                }
                            });

                            let moment_inicio = moment(act.dataValues.tiempo_inicio, "HH:mm").utc();

                            for (let j = 0; j < recurrencias.length; j++) {
                                let rec = recurrencias[j].dataValues;
                                
                                if (!cancelada && recurrence_tool.isInRecurrencia(act, rec, ahora.hours(moment_inicio.hours()).minutes(moment_inicio.minutes()).format('YYYY-MM-DDTHH:mm'))) {
                                    actividades.push(act.dataValues.id);
                                    break;
                                }
                            }
                        }
                        else {
                            if (ahora.format('YYYY-MM-DD') == act.dataValues.fecha_inicio) {
                                actividades.push(act.dataValues.id);
                            }
                        }
                       
                    }
                }

                let ahora_comienzo = moment().utc().hours(comienzo.hours()).minutes(comienzo.minutes()).format('YYYY-MM-DD HH:mm:00');
                let ahora_fin = moment().utc().hours(fin.hours()).minutes(fin.minutes()).format('YYYY-MM-DD HH:mm:00');
                
                const reprogramaciones_act = await db.sequelize.models.Excepcion.findAll({
                    attributes: ['actividad_id'],
                    where: {
                        esta_cancelado: 'No',
                        esta_reprogramado: 'Sí',
                        fecha_inicio_ex: { [Op.lte]: ahora_comienzo },
                        fecha_fin_ex: { [Op.gte]: ahora_fin }
                    }
                });

                reprogramaciones_act.forEach(reprog => {
                    actividades.push(reprog.dataValues.actividad_id);
                });

                if (actividades.length > 0) {
                    const query_doc = await db.sequelize.models.Docente.findAll({
                        include: {
                            model: db.sequelize.models.Actividad,
                            as: 'imparte',
                            where: {
                                id: {
                                    [Op.or]: actividades
                                }
                            }
                        }
                    });

                    let docentes = [];
                    query_doc.forEach((doc) => {
                        docentes.push(doc.dataValues.id);
                    })

                    const query_macs = await db.sequelize.models.Macs.findAll({
                        attributes: ['usuario_id', 'mac'],
                        include: {
                            model: db.sequelize.models.Docente,
                            as: 'asociado_a',
                            where: {
                                id: { [Op.or]: docentes }
                            }
                        }
                    });

                    // Si tiene MACs
                    if (query_macs.length != 0) {
                        query_macs.forEach((mac) => {
                            respuesta.macs.push(mac.dataValues.mac);
                        });
                    }
                }
            }

            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(respuesta);
                    
        }
        catch (error) {
            logger.error(`Error while interacting with database: ${error}`);
            res.status(500).send('Something went wrong');
            await transaction.rollback();
            return;
        }
            
        await transaction.commit();
    }
    else {
        res.status(422).send("Datos no válidos");
    }
}

async function getAsistencias(req, res, db) {

    filtroEstado = req.body.estado || null;
    filtroMotivo = req.body.motivo || null;
    filtroFecha = moment(req.body.fecha + 'Z', 'YYYY-MM-DDZ').utc().format('YYYY-MM-DD 00:00:00[Z]');
    filtroEspacio = req.body.espacioId || null;

    let fechaSiguiente = moment(req.body.fecha + 'Z', 'YYYY-MM-DDZ').utc().add(1, 'days').format('YYYY-MM-DD 00:00:00[Z]');

    const transaction = await db.sequelize.transaction();

    try {
        const query_asist = await db.sequelize.models.Asistencia.findAll({
            attributes: ['id'],
            where: {
                [Op.and]: [
                    (filtroEstado != null) ? { estado: filtroEstado } : {},
                    (filtroMotivo != null) ? { [Op.and]: [(filtroMotivo == 'Sí') ? { motivo: { [Op.not]: null } } : {motivo: { [Op.is]: null } }] } : {},
                    (req.body.fecha != null) ? { fecha: { [Op.gte]: filtroFecha } } :  {},
                    (req.body.fecha != null) ? { fecha: { [Op.lte]: fechaSiguiente }} : {},
                    (filtroEspacio != null) ? { espacio_id: filtroEspacio } : {},
                ]
            }
        });
        
        let respuesta = { asistencias: [] }

        if (query_asist.length > 0) {
            query_asist.forEach((asist) => {
                respuesta.asistencias.push(asist.dataValues);
            }); 
        }
    
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(respuesta);
    }
    catch (error) {
        logger.error(`Error while interacting with database: ${error}`);
        res.status(500).send('Something went wrong');
        await transaction.rollback();
        return;
    }    
    
    await transaction.commit();
}

async function getAsistenciaById(req, res, db) {
    let idAsistencia = Number(req.params.idAsistencia);
    if (!Number.isInteger(idAsistencia)) {
        res.status(400).send('Id suministrado no válido');
        return;
    }

    const transaction = await db.sequelize.transaction();

    try {
        logger.info('Searching in Asistencia for id, docente_id, espacio_id, fecha, estado, motivo');
        const query_asist = await db.sequelize.models.Asistencia.findOne({
            attributes:['id', 'fecha', 'docente_id', 'espacio_id', 'estado', 'motivo'],
            where: {
                id: idAsistencia
            }
        });

        if (query_asist == null || Object.keys(query_asist.dataValues).length == 0) {
            res.status(404).send('Asistencia no encontrada');
            await transaction.rollback();
            return;
        }

        const resultado = { 
            id: query_asist.id, fecha: query_asist.fecha,
            motivo: query_asist.motivo, docenteId: query_asist.docente_id,
            espacioId: query_asist.espacio_id, query_asist: query_asist.estado
        };

        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(resultado);
    }
    catch (error) {
        logger.error(`Error while interacting with database: ${error}`);
        res.status(500).send('Something went wrong');
        await transaction.rollback();
        return;
    }
      
    await transaction.commit(); 
}

async function updateAsistenciaById(req, res, db) {

    let idAsistencia = Number(req.params.idAsistencia);
    if (!Number.isInteger(idAsistencia)) {
        res.status(400).send('Id suministrado no válido');
        return;
    }

    if (req.body.estado != null && !valoresAsistencia.includes(req.body.estado)) {
        res.status(422).send('Datos no válidos');
        return;
    }

    const transaction = await db.sequelize.transaction();

    try {
        logger.info('Searching in Asistencia for id, docente_id, espacio_id, fecha, estado, motivo');
        const query_asist = await db.sequelize.models.Asistencia.findOne({
            attributes:['id', 'fecha', 'docente_id', 'espacio_id', 'estado', 'motivo'],
            where: {
                id: idAsistencia
            }
        });

        if (query_asist == null || Object.keys(query_asist.dataValues).length == 0) {
            res.status(404).send('Asistencia no encontrada');
            await transaction.rollback();
            return;
        }

        let update_data = {};
        let resultado = query_asist.dataValues;

        if (req.body.estado != null) {
            update_data.estado = req.body.estado;
            resultado.estado = req.body.estado;
        }
        if (req.body.motivo != null) {
            update_data.motivo = req.body.motivo;
            resultado.motivo = req.body.motivo;
        }

        const nueva_asist = await db.sequelize.models.Asistencia.update(update_data, {
            where: {
                id: idAsistencia
            }
        });

        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(resultado);
    }
    catch (error) {
        logger.error(`Error while interacting with database: ${error}`);
        res.status(500).send('Something went wrong');
        await transaction.rollback();
        return;
    }
      
    await transaction.commit(); 
}

module.exports = {
    registroAsistencia, getMacsBLE, getAsistencias, getAsistenciaById, updateAsistenciaById
}

async function checkEstadoAsistencia(db, res, docenteId, espacioId) {

    let actividades_posibles = [];

    // Comprobar que en la hora actual ese profesor tenga una asignatura en ese espacio para validar el estado
    const query_act = await db.sequelize.models.Actividad.findAll({
        attributes: ['id', 'tiempo_inicio', 'tiempo_fin', 'es_recurrente', 'fecha_inicio', 'fecha_fin'],
        include: {
            model: db.sequelize.models.Docente,
            as: 'impartida_por',
            where: {
                id: docenteId
            } 
            },
            include: {
                model: db.sequelize.models.Espacio,
                as: 'impartida_en',
                where: {
                    id: espacioId
                }
            }
        });
                            
        for (let i = 0; i < query_act.length; i++) {
            const act = query_act[i].dataValues;
            // Comprobar si existe excepcion que este reprogramada para hoy
            // Si esta cancelada, pasamos de ella
            const query_ex = await db.sequelize.models.Excepcion.findAll({
                attributes: ['esta_cancelado', 'esta_reprogramado', 'fecha_inicio_act', 'fecha_fin_act', 'fecha_inicio_ex', 'fecha_fin_ex'],
                where: {
                    actividad_id: act.id
                }
            });


            let ignore_actividad = false;
            for (let j = 0; j < query_ex; j++) {
                let excep = query_ex[j].dataValues;
                let a_comparar = moment().format('YYYY-MM-DD HH:mm');
                //Está reprogramado para ahora, y no cancelado (está antes en el if para comprobar casos de desplazamientos menores que la duración del evento original)
                if (excep.esta_cancelado == 'No' && excep.esta_reprogramado == 'Sí' && 
                    moment(excep.fecha_inicio_ex + 'Z').format('YYYY-MM-DD HH:mm') >= a_comparar &&
                    moment(excep.fecha_fin_ex + 'Z').format('YYYY-MM-DD HH:mm') <= a_comparar) {
                        actividades_posibles.push(act);
                        break;
                } //Está cancelada la instancia de ahora o se ha reprogamado para otro día
                else if ((excep.esta_cancelado == 'Sí' || excep.esta_reprogramado == 'Sí') && 
                    moment(excep.fecha_inicio_act + 'Z').format('YYYY-MM-DD HH:mm') >= a_comparar &&
                    moment(excep.fecha_fin_act + 'Z').format('YYYY-MM-DD HH:mm') <= a_comparar) {
                        ignore_actividad = true;
                        break;
                }
            }

            if (ignore_actividad) continue;

            // Si no tiene excepcion para este día
            const currentHour = moment().format('HH:mm');
            const inicio = moment(act.tiempo_inicio, 'HH:mm');
            const fin = moment(act.tiempo_fin, 'HH:mm');
            if (inicio <= currentHour && currentHour <= fin) {
                if (act.es_recurrente == 'Sí') {
                    const query_rec = await db.sequelize.models.Recurrencia.findAll({
                        where: {
                            actividad_id: act.id
                        }
                    });
        
                    query_rec.forEach(rec => {
                        rec_list.push(rec.dataValues)
                    });
                                        
                    let [exists, last] = recurrence_tool.getLastEventOfActividad(act, rec_list).utc();
                    // Si está en el día de hoy, Asistida, si no, la ignoramos
                    if (exists && last.format('YYYY-MM-DD') == moment().utc().format('YYYY-MM-DD')) {
                        actividades_posibles.push(act);
                    }
        
                }
                else if (moment(act.fecha_inicio + 'Z').format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                    actividades_posibles.push(act);
                }
            }
        }
    

    return actividades_posibles > 0;
}