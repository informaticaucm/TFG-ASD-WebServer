import { apiLogger, uiLogger } from '@informaticaucm/seguimiento-logger';
import { mailer } from '../config/mail.js';
import { uiConfig } from '../config/server.js';
import { sendToApiJSON, getFromApi } from '../seguimientoApi.js';
import moment from 'moment';

/**
 * Obtiene todas las excepciones en un intervalo de fechas usando la API.
 * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
 * @param {object} res - El objeto response de Express (para gestión de sesión/cookies)
 * @returns {Promise<object>} - Un objeto con la propiedad 'excepciones' (array)
 */
export async function obtenerExcepcionesPorIntervalo(fechaInicio, fechaFin, res) {
    try {
        const resultado = await getFromApi(
            `/excepciones/intervalo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
            res,
            true
        );
        return resultado; // { excepciones: [...] }
    } catch (error) {
        console.error('Error al obtener excepciones:', error);
        throw new Error('Ocurrió un error al obtener las excepciones.');
    }
}

export async function verExcepciones(req, res) {
    // Prioriza req.body.fechaInicio/fechaFin, pero usa req.query si no están disponibles
    const fechaInicio = req.body.fechaInicio || req.query.fechaInicio || moment().startOf('month').format('YYYY-MM-DD');
    const fechaFin = req.body.fechaFin || req.query.fechaFin || moment().endOf('month').format('YYYY-MM-DD');

    // Llama a la API para obtener las excepciones en el intervalo
    const resultado = await getFromApi(
        `/excepciones/intervalo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
        res,
        true
    );

    const excepciones = resultado.excepciones || [];
    let excepcionesDetalladas = [];

    for (let i = 0; i < excepciones.length; i++) {
        const ex = excepciones[i];
        // Puedes enriquecer la excepción con más info si lo necesitas:
        // Por ejemplo, obtener la actividad asociada:
        let actividad = null;
        if (ex.actividad_id) {
            actividad = await getFromApi(`/actividades/${ex.actividad_id}`, res, true);
        }
        excepcionesDetalladas.push({
            ...ex,
            actividad: actividad ? actividad.nombre : undefined
            // Puedes añadir más campos aquí si lo necesitas
        });
    }

    return {
        excepciones: excepcionesDetalladas,
        fechaInicio,
        fechaFin
    };
}

/**
 * Devuelve un resumen de excepciones y datos para gráficos, enriqueciendo con nombres de asignatura.
 */
export async function obtenerResumenExcepciones(fechaInicio, fechaFin, res) {
    // 1. Obtener excepciones del backend
    const resultado = await getFromApi(
        `/excepciones/intervalo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
        res,
        true
    );
    const excepciones = resultado.excepciones || [];

    // 2. Procesar para gráfico de tipos
    const datosExcepciones = {
        Canceladas: excepciones.filter(e => e.esta_cancelado === 'Sí').length,
        Reprogramadas: excepciones.filter(e => e.esta_reprogramado === 'Sí').length
    };

    // 3. Contar excepciones por actividad_id
    const excepcionesPorActividad = {};
    excepciones.forEach(e => {
        if (!excepcionesPorActividad[e.actividad_id]) {
            excepcionesPorActividad[e.actividad_id] = 0;
        }
        excepcionesPorActividad[e.actividad_id]++;
    });

    // 4. Top 5 actividades con más excepciones
    const topActividades = Object.entries(excepcionesPorActividad)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // 5. Enriquecer con nombre de asignatura
    const topActividadesLabels = [];
    const topActividadesData = [];
    for (const [actividadId, count] of topActividades) {
        let asignaturaNombre = `Actividad ${actividadId}`;
        try {
            const actividad = await getFromApi(`/actividades/${actividadId}`, res, true);
            if (actividad && actividad.clase_ids && actividad.clase_ids.length > 0) {
                const claseId = actividad.clase_ids[0].id;
                const clase = await getFromApi(`/clases/${claseId}`, res, true);
                if (clase && clase.asignatura_id) {
                    const asignatura = await getFromApi(`/asignaturas/${clase.asignatura_id}`, res, true);
                    if (asignatura) {
                        asignaturaNombre = asignatura.nombre;
                    }
                }
            }
        } catch (error) {
            console.error(`Error al obtener datos para actividad ${actividadId}:`, error);
        }
        topActividadesLabels.push(asignaturaNombre);
        topActividadesData.push(count);
    }

    return {
        datosExcepciones,
        topActividadesLabels,
        topActividadesData
    };


}

export async function getExcepcionesByDocente(idDocente,res) {
    apiLogger.info(`Fetching excepciones for docente ${idDocente} in getExcepcionesByDocente`);

    try {

        console.log(`Fetching excepciones for docente ${idDocente} in getExcepcionesByDocente in excepciones.js`);
        const excepciones = await getFromApi(`/excepciones/docentes/${idDocente}`, res, true);
        return excepciones;
    }
    catch (error) {
        console.error('Error al obtener excepciones por docente:', error);
        throw new Error('Ocurrió un error al obtener las excepciones del docente.');
    }
}