// routes/actividadesRoutes.js
import { actividadesUsuarioControllerFactory } from '../controllers/actividadesController.js';
import { Router } from 'express';
import { getConnection } from '../config/db.js';

const db = getConnection();
const actividadesRouter = new Router();

// Asociar la ruta con el controlador
actividadesRouter.get('/:idUsuario', actividadesUsuarioControllerFactory(db));

export default actividadesRouter;
