const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const { authRole, ROLE } = require('../middleware/authRoles');

router.get('/', authRole([ROLE.ALL]), (req, res, next) => {
    const games = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM games',
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum game'
                    });
                }

                for(var x = 0 in resultado){
                    games.push({
                        idGame: resultado[x].idGame,
                        name: resultado[x].name,
                        descriptionText: resultado[x].text,
                        tier: resultado[x].tier,
                        price: resultado[x].price,
                        date: resultado[x].date,
                        platform: resultado[x].platform,
                        image: resultado[x].image,
                    })
                }
                return res.status(200).send({ items: games });
            }
        )
    });
});

router.post('/', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const game = []
    game.push({
        idGame: null,
        name: req.body.name,
        tier: req.body.tier,
        descriptionText: req.body.descriptionText,
        platform: req.body.platform,
        image: req.body.image
    });

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'INSERT INTO `games` (`idGame`, `name`, `tier`, `descriptionText`, `platform`, `image`) VALUES (NULL, ?, ?, ?, ?, ?);',
            [game[0].name, game[0].tier, game[0].descriptionText, game[0].platform, game[0].image],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                game[0].idGame = resultado.insertId;
                    
                res.status(201).send({
                    message: 'Jogo cadastrado com sucesso!',
                    items: game
                });
            }
        )
    });
});

router.delete('/:idGame', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const id = req.params.idGame

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'DELETE FROM games WHERE idGame = ?;',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};
    
                return res.status(201).send({
                    message: 'Jogo deletado com sucesso!',
                });
            }
        )
    });
});



module.exports = router;