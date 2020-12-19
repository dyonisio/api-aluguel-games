const jwt = require('jsonwebtoken');

const ROLE = {
    ALL: 'all',
    ADMIN: 'admin',
    FUNCIONARIO: 'funcionario',
    USUARIO: 'user'
}

function authRole(role){
    return (req, res, next) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decode = jwt.verify(token, process.env.JWT_KEY);
            var roleChecked = false;

            for(var x = 0 in role){
                if(decode.role == role[x]){
                    roleChecked = true;
                }
            }

            if(role == ROLE.ALL){
                roleChecked = true;
            }

            if(!roleChecked){
                return res.status(401).send({ error: "Não autorizado"});
            }
            
            req.user = decode;
            next();   
        } catch {
            return res.status(401).send({ error: "Não autorizado"});
        }  
    }
}

module.exports = {
    authRole,
    ROLE: ROLE
}