import express from "express";
import routes from './routes/index.routes.js';

const app = express();

//Activamos JSON para APIs
app.use(express.json());
//Activamos urlencoded para Formularios HTML
app.use(express.urlencoded({extended:true}));

//Conectamos las rutas
app.use(routes);

export default app;