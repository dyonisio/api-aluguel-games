const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const routeUsers = require('./routes/users');
const routeGames = require('./routes/games');
const routeAuth = require('./routes/auth');

var corsOptions = {
    origin: '*'
};

app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/users', routeUsers);
app.use('/games', routeGames);
app.use('/auth', routeAuth);

app.use((req, res, next) =>{
    const erro = new Error('Rota não encontrada');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    return res.send({
        error: {
            message: error.message
        }
    });
});

module.exports = app;