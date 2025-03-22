import he from 'he';

export function escapeRequest(req, res, next) {
    var datos;
    for(datos in req.body) {
        console.log(datos)
        let value = req.body[datos];
        req.body[datos] = accentIgnorer(value);
    }
    next()
}

// Usado para no escapar tildes y ñ (estamos en España)
function accentIgnorer(str) {
    let encoded_str = '';
    
    for (let i = 0; i < str.length; i++) {
		let chr = str[i];
        if (/[áàâäéèêëíìîïóòôöúùûüñ]/i.test(chr)) {
            encoded_str += chr
        }
		else {
			encoded_str += he.encode(chr);
		}
    }

    return encoded_str;
}

export function checkRequest(body_list) {
    return (req, res, next) => {
        var elem;
        for (elem in body_list) {
            if (!req.body[body_list[elem]]) {
                res.render('error', {error: 'Datos no válidos', redirect: req.originalUrl});
                return false;
            }
        }
        
        next();
        return true;
    }
}
