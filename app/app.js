const express = require('express');
const compression = require('compression');
const path = require('path');
const bodyParser = require('body-parser');
// cors
const cors = require('cors');

// endpoint
const appRoutes = require('./routes/app-routes');
// inicializar
const app = express();

// utilizar vistas de handlebars
app.set('views', path.join(__dirname, 'views'));
// config de handlebars
app.set('view engine', 'hbs');

app.use(cors());
app.use(compression());
// habilitar bodyparser para enviar datos tipo json
app.use(bodyParser.json());
// archivo a compilar en el navegador
app.use(express.static(path.join(__dirname, '../public')));
// rutas que vienen desde el archivo app-routes.js
app.use(appRoutes);

// build
app.use(function (req, res, next) {
    // renderiza la pagina incial
    res.render('index');
});

// error handler
// will print stacktrace
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.json({
        message: err.message,
        status: err.status
    });
});

// exportar el modulo
module.exports = app;
