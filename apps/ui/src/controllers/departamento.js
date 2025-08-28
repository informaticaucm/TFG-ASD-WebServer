import { apiLogger, uiLogger } from '@informaticaucm/seguimiento-logger';
import { uiConfig } from '../config/server.js';
import { sendToApiJSON, getFromApi } from '../seguimientoApi.js';


export async function obtenerDepartamentoPorDocente(docenteId, res) {
    // Llama a la API que creaste en backend: /departamentos/docente/:docenteId
    const resultado = await getFromApi(`/departamentos/docente/${docenteId}`, res, true);
    console.log("Resultado de obtenerDepartamentoPorDocente: ", resultado);
    return resultado.departamento;
}