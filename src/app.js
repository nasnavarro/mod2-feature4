import express from "express";
import helmet from "helmet";
import cors from "cors";
import routes from './routes/index.routes.js';

const app = express();

// Añade cabeceras HTTP de seguridad automáticamente
app.use(helmet());
// Permite peticiones solo desde el dominio configurado en CORS_ORIGIN
app.use(cors({ origin: process.env.CORS_ORIGIN }));

//Activamos JSON para APIs
app.use(express.json());
//Activamos urlencoded para Formularios HTML
app.use(express.urlencoded({extended:true}));

//Conectamos las rutas
app.use(routes);

export default app;