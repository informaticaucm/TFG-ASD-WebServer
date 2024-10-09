import { uiConfig } from './config/server.js';
import { uiLogger } from '@informaticaucm/seguimiento-logger';
import { console_morgan, file_morgan } from '@informaticaucm/seguimiento-logger';
import express from 'express';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import moment from 'moment';
import session from 'express-session';
import * as middleware from './middleware/index.js';
import MemoryStoreBuilder from 'memorystore';
import { valoresAsistencia } from '@informaticaucm/seguimiento-api-client';
import * as app_controllers from './controllers/index.js';

const memory_store = MemoryStoreBuilder(session);
const app = express();

/// TODO: node >= 20.11 import.meta.dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticFolder = __dirname + '/public';

const valoresRol = ['Usuario', 'Decanato', 'Admin'];

uiLogger.info(`Starting app considering timezone ${uiConfig.timezone}`);

app.set('views', join(staticFolder, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
app.use(console_morgan);
app.use(file_morgan);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: uiConfig.session_secret,
  resave: false,
  saveUninitialized: true,
  // Hacer la sesión expirable
  cookie: {
    maxAge: 30 * 60 * 1000 // 30 minutos en milisegundos
  },
  store: new memory_store({
    checkPeriod: 30 * 60 * 1000 // 30 minutos en milisegundos
  })
}));

// Página web
app.get('/', checkSesion, (req, res) => {
  uiLogger.info('Get / detected');
  res.render('index', {usuario: req.session.user});
});

app.get('/login', (req, res) => {
  res.render('login', {usuario: ''}); 
})

app.post('/login', [middleware.escapeRequest, middleware.checkRequest(['usuario', 'password', 'timezone'])], async (req, res) => {
  uiLogger.info(`Got a POST in login with ${JSON.stringify(req.body)}`);
  await app_controllers.session.login(req, res);
});

app.get('/logout', [checkSesion, middleware.keepCookies([])], async (req, res) => {
  uiLogger.info('Got a GET in logout');
  await app_controllers.session.logout(req, res);
});

app.get('/formulario-aulas', [checkSesion, middleware.keepCookies([])], async (req, res) => {
  uiLogger.info('Got a GET in formulario-aulas');
  await app_controllers.form.getEspaciosPosibles(req, res);
});

app.post('/formulario-aulas', [checkSesion, middleware.keepCookies(['estado']), middleware.escapeRequest, 
    middleware.checkRequest(['espacio'])], (req, res) => {
  
  uiLogger.info(`Got a POST in formulario-aulas with ${JSON.stringify(req.body)}`);
  app_controllers.form.confirmEspacioPosible(req, res);
});

app.get('/formulario-end', [checkSesion, middleware.keepCookies(['estado'])], async (req, res) => {
  uiLogger.info(`Got a GET in formulario-end with ${JSON.stringify(req.body)}`);
  await app_controllers.form.getForm(req, res);
});

app.post('/formulario-end', [checkSesion, middleware.keepCookies(['actividades_ids', 'espacio_id', 'estado']),
    middleware.escapeRequest, middleware.checkRequest(['docente', 'espacio', 'hora'])], async (req, res) => {
  uiLogger.info(`Got a POST in formulario-end with ${JSON.stringify(req.body)}`);
  app_controllers.form.postForm(req, res);
});

app.get('/formulario-aulas-qr', [checkSesion, middleware.keepCookies([])], async (req, res) => {
  uiLogger.info('Got a GET in formulario-aulas-qr');
  await app_controllers.form.getAllEspacios(req, res);
});

app.post('/formulario-aulas-qr', [checkSesion, middleware.keepCookies([]), middleware.escapeRequest], 
    (req, res) => {
  uiLogger.info(`Got a POST in formulario-aulas-qr with ${JSON.stringify(req.body)}`);
  res.redirect(`formulario-end-qr/?espacio=${req.body.espacio}`);
});

app.get('/formulario-end-qr', [checkSesion, middleware.keepCookies([])], (req, res) => {
  uiLogger.info('Got a GET in formulario-end-qr');
  res.render('formulario-end-qr', {usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos}});
});

app.get('/lista-registro-motivo-falta', [checkSesion, middleware.keepCookies([])], async (req, res) => {
  uiLogger.info(`Got a GET in lista-registro-motivo-falta`);
  const resultado = await app_controllers.asistencia.getAJustificar(req, res);
  res.render('lista-registro-motivo-falta', {clases: resultado, 
    usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos}
  });
});

app.get('/registro-motivo-falta', [checkSesion, middleware.keepCookies(['no_justificadas'])], (req, res) => {
  uiLogger.info(`Got a GET in registro-motivo-falta`);
  res.render('registro-motivo-falta', { resultado: {fechayhora: req.query.fecha, clase: req.query.clase}, 
    usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos}
  });
});

app.post('/registro-motivo-falta', [checkSesion, middleware.keepCookies(['no_justificadas']),
    middleware.escapeRequest, middleware.checkRequest(['motivo'])], (req, res) => {
  uiLogger.info(`Got a POST in registro-motivo-falta with ${JSON.stringify(req.body)}`);
  app_controllers.asistencia.justificar(req, res);
});

app.get('/anular-clase', [checkSesion, middleware.keepCookies([])], (req, res) => {
  uiLogger.info(req.query);
  let fechayhora = req.query.fecha || moment.now();
  app_controllers.clase.getClases(req, res, fechayhora);
});

app.post('/anular-clase', [checkSesion, middleware.keepCookies([]), middleware.escapeRequest, 
    middleware.checkRequest(['meeting_time', 'motivo'])], async (req, res) => {
  uiLogger.info(`Got a POST in anular-clase with ${JSON.stringify(req.body)}`);
  app_controllers.clase.anularClase(req, res);
});

app.get('/verificar-docencias', [checkSesion, checkClearanceAdministracion, middleware.keepCookies([])], async (req, res) => {
  uiLogger.info(`Got a GET in verificar-docencias`);
  let resultado = await app_controllers.asistencia.verAsistencias(req, res);
  res.render('verificar-docencias', {usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos},
    fecha: resultado.fecha, fecha_max: resultado.fecha_max, asistencias: resultado.asistencias, valores_asist: valoresAsistencia
  });
});

app.post('/verificar-docencias', [checkSesion, checkClearanceAdministracion, middleware.keepCookies([])], async (req, res) => {
  uiLogger.info(`Got a POST in verificar-docencias with ${JSON.stringify(req.body)}`);
  let resultado = await app_controllers.asistencia.verAsistencias(req, res);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send({asistencias: resultado.asistencias});
});

app.get('/registrar-firmas', [checkSesion, checkClearanceAdministracion, middleware.keepCookies([])], async (req, res) => {
  uiLogger.info(`Got a GET in registrar-firmas`);
  await app_controllers.asistencia.filtrarAsistencias(req, res);
});

app.post('/registrar-firmas', [checkSesion, checkClearanceAdministracion, 
    middleware.keepCookies(['no_asistidas', 'sustituto_ids', 'resultado_firma', 'espacio_firma'],
    middleware.escapeRequest)], async (req, res) => {
  uiLogger.info(`Got a POST in registrar-firmas with ${JSON.stringify(req.body)}`);
  if (req.body.postType == 'filtro') {
    middleware.checkRequest(req, ['fecha', 'espacio']);
    app_controllers.asistencia.filtrarAsistencias(req, res);
  }
  else if (req.body.postType == 'firma') {  
    middleware.checkRequest(req, ['pos']);
    app_controllers.asistencia.confirmarFirma(req, res);
  }
});

app.get('/crear-usuario', [checkSesion, checkClearanceAdministracion || checkClearanceDecanato, middleware.keepCookies([])], async (req, res) => {
  uiLogger.info(`Got a GET in crear-usuario`);
  let resultado = {
    email: '',
    nombre: '',
    apellidos: '',
    password: ''
  }
  res.render('crear-usuario', {resultado: resultado, usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos}, 
      roles: valoresRol});
});

app.post('/crear-usuario', [checkSesion, checkClearanceAdministracion || checkClearanceDecanato, middleware.keepCookies([]),
    middleware.escapeRequest, middleware.checkRequest(['nombre', 'apellidos', 'email', 'rol', 'password'])], 
    async (req, res) => {
  uiLogger.info(`Got a POST in crear-usuario with ${JSON.stringify(req.body)}`);
  
  try {
    await app_controllers.session.createUser(req, res);
  }
  catch (error) {
    let redo = {
      email: req.body.email,
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      password: req.body.password
    }
    res.render('crear-usuario', {resultado: redo, error: JSON.parse(error.message), usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos}, roles: valoresRol});
    return;
  }
});

app.get('/generar-avisos', [checkSesion, checkClearanceAdministracion, middleware.keepCookies([])], async (req, res) => {
  uiLogger.info(`Got a GET in generar-avisos`);
  const resultado = await app_controllers.asistencia.generarAvisos(req, res);
  res.render('generar-avisos', {resultado: resultado, usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos}});
});

app.post('/generar-avisos', [checkSesion, checkClearanceAdministracion, middleware.checkRequest(['tipo']),
    middleware.keepCookies([]), middleware.escapeRequest], async (req, res) => {
  uiLogger.info(`Got a POST in generar-avisos with ${JSON.stringify(req.body)}`);
  if (req.body.tipo == 'filtroFecha') {
    const resultado = await app_controllers.asistencia.generarAvisos(req, res);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send({asistencias: resultado.clases});
  }
  else if (req.body.tipo == 'avisos') {
    await app_controllers.asistencia.enviarAvisos(req, res);
  }
});

app.get('/registro-mac', [checkSesion, middleware.keepCookies([]), middleware.escapeRequest], async (req, res) => {
  uiLogger.info('Got a GET in registrar-macs');
  res.render('registro-mac', {usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos}});
});

app.post('/registro-mac', [checkSesion, middleware.keepCookies([]), middleware.escapeRequest, 
    middleware.checkRequest(['mac1'])], async (req, res) => {
  uiLogger.info(`Got a POST in registro-mac with ${JSON.stringify(req.body)}`);
  
  try {
    await app_controllers.session.assignMAC(req, res);
  }
  catch (error) {
    res.render('registro-mac', {error: JSON.parse(error.message), usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos}});
    return;
  }
});

app.get('/registro-nfc', [checkSesion, middleware.keepCookies([]), middleware.escapeRequest], async (req, res) => {
  uiLogger.info('Got a GET in registrar-macs');
  res.render('registro-nfc', {usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos}});
});

app.post('/registro-nfc', [checkSesion, middleware.keepCookies([]), middleware.escapeRequest,
    middleware.checkRequest(['nfc1'])], async (req, res) => {
  uiLogger.info(`Got a POST in registro-nfc with ${JSON.stringify(req.body)}`);
  
  try {
    await app_controllers.session.assignNFC(req, res);
  }
  catch (error) {
    res.render('registro-nfc', {error: JSON.parse(error.message), usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos}});
    return;
  }
});

app.get('/generar-avisos', [checkSesion, checkClearanceAdministracion, middleware.keepCookies([])], async (req, res) => {
  uiLogger.info(`Got a GET in generar-avisos`);
  const resultado = await app_controllers.asistencia.generarAvisos(req, res);
  res.render('generar-avisos', {resultado: resultado, usuario: {rol: req.session.user.rol, nombre: req.session.user.nombre, apellidos: req.session.user.apellidos}});
});

app.post('/generar-avisos', [checkSesion, checkClearanceAdministracion, middleware.checkRequest(['tipo']),
    middleware.keepCookies([]), middleware.escapeRequest], async (req, res) => {
  uiLogger.info(`Got a POST in generar-avisos with ${JSON.stringify(req.body)}`);
  if (req.body.tipo == 'filtroFecha') {
    const resultado = await app_controllers.asistencia.generarAvisos(req, res);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send({asistencias: resultado.clases});
  }
  else if (req.body.tipo == 'avisos') {
    await app_controllers.asistencia.enviarAvisos(req, res);
  }
});

app.get('/profesores-infracciones', [checkSesion, checkClearanceDecanato, middleware.keepCookies([])], async (req, res) => {
  uiLogger.info(`Got a GET in profesores-infracciones`);
  await app_controllers.asistencia.verProfesoresInfracciones(req, res);
});

app.listen(uiConfig.port, () => {
  const port_spec = (uiConfig.port_spec) ? ':' + uiConfig.port : ''
  uiLogger.info(`App listening on port ${uiConfig.port} at ${uiConfig.protocol}://${uiConfig.host}${port_spec}`);
});

// Utiliza staticname como directorio para los ficheros, lo que permite que cargue el css de los archivos.
// Importante que esté debajo de get '/', para que este rediriga a login (Si no, se dirige a /index.ejs)
app.use(express.static(staticFolder));

// Funcion auxiliar para redirigir a /login si no hay sesión iniciada que guarda el valor de la página
// a redirigir después de hacer login
// Si emmitter == null, por defecto, el código de login lo enviará a /
function checkSesion(req, res, next) {
  if (req.session.user) {
    next();
  }
  else {
    req.session.redirectTo = req.originalUrl;
    req.session.save();
    res.redirect('/login');
  }
}

function checkClearanceDecanato(req, res, next) {
  if (req.session.user.rol == valoresRol[1]) {
    next();
    return true;
  }
  else {
    res.render('error', {error: 'No tienes permisos para acceder a esta página'})
    return false;
  }
}

function checkClearanceAdministracion(req, res, next) {
  if (req.session.user.rol == valoresRol[2]) {
    next();
    return true;
  }
  else {
    res.render('error', {error: 'No tienes permisos para acceder a esta página'})
    return false;
  }
}