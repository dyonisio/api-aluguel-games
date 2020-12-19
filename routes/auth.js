const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


/**
 * @swagger
 * /api/auth/signin:
 *  post:
 *    description: Usado para se logar
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: body
 *        name: 'loginPayload'
 *        description: 'Informações do usuario que está logando'
 *    responses:
 *      '200':
 *          description: 'Autenticado com sucesso'
 *      '401':
 *          description: 'E-mail ou senha incorretos'
 *      '500':
 *          description: 'Internal Error'
 */

router.post('/signin', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};
        const query = 'SELECT * FROM users WHERE email = ?';
        conn.query(query,[req.body.email],(error, resultado, fields) =>{
            conn.release();
            if(error){return res.status(500).send({ error: error })}
            if(resultado.length < 1) { return res.status(401).send({ error: 'E-mail ou senha incorretos'}) }

            bcrypt.compare(req.body.password, resultado[0].password, (err, result) => {
                if(err){
                    return res.status(401).send({ error: 'E-mail ou senha incorretos'})
                }
                if(result){
                    const token = jwt.sign({
                        idUser: resultado[0].idUser,
                        name: resultado[0].name,
                        role: resultado[0].role
                    }, process.env.JWT_KEY,
                    {
                        expiresIn: "30d"
                    });

                    return res.status(200).send({ 
                        message: 'Autenticado com sucesso',
                        token: "Bearer " + token,
                        expiresAt: jwt.decode(token, process.env.JWT_KEY).exp
                    })
                }    
                return res.status(401).send({ error: 'E-mail ou senha incorretos'})
            });
            
        });
    });
});


module.exports = router;