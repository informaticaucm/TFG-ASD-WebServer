import { asistenciaControllerFactory } from './controller.js';
import { Router } from 'express';
import { getConnection } from './config/db.js';

const db = getConnection();
const asistenciaRouter = new Router();

const controller = asistenciaControllerFactory(db);

// Rutas para Asistencia
asistenciaRouter.get('/:docenteId/:espacioId/:fecha', controller.obtener);
asistenciaRouter.post('/', controller.crear);
asistenciaRouter.put('/:id', controller.actualizar);

export default asistenciaRouter;
