const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const { authRole, ROLE } = require('../middleware/authRoles');

router.get('/', authRole([ROLE.ADMIN]), (req, res, next) => {
    const user = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM users',
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum usuario'
                    });
                }

                for(var x = 0 in resultado){
                    user.push({
                        idUser: resultado[x].idUser,
                        name: resultado[x].name,
                        email: resultado[x].email,
                        role: resultado[x].role
                    });
                }
                return res.status(200).send({ items: user });
            }
        )
    });
});

//RETORNA O USUARIO LOGADO
router.get('/me', authRole([ROLE.ALL]), (req, res, next) => {
    const idUser = req.user.idUser;

    const user = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM users WHERE idUser = ?',
            [idUser],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum usuario com esse ID'
                    });
                }

                for(var x = 0 in resultado){
                    user.push({
                        idUser: resultado[x].idUser,
                        name: resultado[x].name,
                        email: resultado[x].email,
                        role: resultado[x].role
                    });
                }
                return res.status(200).send({ items: user });
            }
        )
    });
});

//RETORNA UM USUARIO ESPECIFICO
router.get('/:idUser', authRole([ROLE.ADMIN]), (req, res, next) => {
    const id = req.params.idUser

    const user = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM users WHERE idUser = ?',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum usuario com esse ID'
                    });
                }

                for(var x = 0 in resultado){
                    user.push({
                        idUser: resultado[x].idUser,
                        name: resultado[x].name,
                        email: resultado[x].email,
                        role: resultado[x].role
                    });
                }
                return res.status(200).send({ items: user });
            }
        )
    });
});

//CADASTRA UM USUARIO
router.post('/', (req, res, next) => {
    const user = []
    user.push({
        idUser: null,
        name: req.body.name,
        email: req.body.email,
    });

    mysql.getConnection((error, conn) => {
        console.log("A");
        if(error){return res.status(500).send({ error: error})};
        conn.query('SELECT * FROM users WHERE email = ?',[req.body.email], (error, resultado) => {
            console.log("B");
            if(error){return res.status(500).send({ error: error})};
            if(resultado.length > 0){
                res.status(409).send({ error: 'EMAIL já utilizado'})
            } else {
                bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                    console.log("c");
                    if(errBcrypt){return res.status(500).send({ error: errBcrypt })}
    
                    conn.query(
                        'INSERT INTO `users` (`idUser`, `name`, `email`, `password`) VALUES (NULL, ?, ?, ?);',
                        [user[0].name, user[0].email, hash],
                        (error, resultado, field) => {
                            conn.release();
                            console.log("D");
                            if(error){return res.status(500).send({ error: error})};
    
                            user[0].idUser = resultado.insertId;
                                
                            res.status(201).send({
                                message: 'Usuario cadastrado com sucesso!',
                                items: user
                            });
                        }
                    )
                });
            }
        });
    });
});

//DELETA UM USUARIO
router.delete('/:idUser', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const id = req.params.idUser

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'DELETE FROM users WHERE idUser = ?;',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};
    
                return res.status(201).send({
                    message: 'Usuario deletado com sucesso!',
                });
            }
        )
    });
});

module.exports = router;