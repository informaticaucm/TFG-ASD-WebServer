import { apiLogger, uiLogger } from '@informaticaucm/seguimiento-logger';
import { uiConfig } from '../config/server.js';
import { sendToApiJSON, getFromApi } from '../seguimientoApi.js';


export async function obtenerDepartamentoPorDocente(docenteId, res) {
    // Llama a la API que creaste en backend: /departamentos/docente/:docenteId
    const resultado = await getFromApi(`/departamentos/docente/${docenteId}`, res, true);
    return resultado.departamento;
}

export async function obtenerDocentesPorDepartamento(incidencias, departamentos, res) {
  const listaInc = Array.isArray(incidencias) ? incidencias : [];
  const listaDep = Array.isArray(departamentos) ? departamentos : [];

  const resultado = [];

  for (const dep of listaDep) {
    const departamento_id = Number(dep.id);
    const departamento_nombre = dep.nombre || 'Departamento';

    let total = 0;
    const detalle = [];

    for (const inc of listaInc) {
      const docenteId = Number(inc.docente_id);
      const cantidad = Number(inc.cantidad) || 0;
      if (!cantidad) continue;

      const depDocente = await obtenerDepartamentoPorDocente(docenteId, res); // { id, nombre, ... }
      if (depDocente && Number(depDocente.id) === departamento_id) {
        total += cantidad;
        detalle.push({ docente_id: docenteId, cantidad });
      }
    }

    if (total > 0) {
      resultado.push({
        departamento_id,
        departamento_nombre,
        total_incidencias: total,
        docentesConIncidencias: detalle
      });
    }
  }

  // Orden descendente
  resultado.sort((a, b) => b.total_incidencias - a.total_incidencias);
  return resultado;
}