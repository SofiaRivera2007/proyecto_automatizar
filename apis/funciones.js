//--------------------------------------------------------------Conexion con la base de datos--------------------------------------------------------------
const Pool = require('pg').Pool
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "admin",
    database: "admiCR",
    port: 5432
})

//--------------------------------------------------------------Encriptar clave--------------------------------------------------------------
const bcrypt = require('bcrypt');
const saltrounds = 10


//--------------------------------------------------------------Registro de personas--------------------------------------------------------------
const registro = (request, response) => {
    const {nombre, apellido1, apellido2, correo, clave, rol } = request.body;

    const query = "INSERT INTO usuario (nombre, apellido1, apellido2, correo, clave, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING correo";
    bcrypt.hash(clave, saltrounds, function(err, hash){
      if(err){
        response.status(400).send('Error');
      }else{
        pool.query(query, [nombre, apellido1, apellido2, correo, hash, rol], (error, results) => {
          console.log(error)
            if (error) {
              response.status(400).send({mensaje: 'No se pudo registrar'});
            } else
            response.status(201).send(results.rows[0])
            //response.status(201).send()
          });
      }
    });
  }


const cambiarContrasena = (request, response) => {
  const { actual, nueva, correo } = request.body;
  const query = "SELECT clave FROM usuario WHERE correo = $1";

  pool.query(query, [correo], (error, results) => {
    if (error || results.rows.length === 0) {
      return response.status(400).send({ mensaje: 'Usuario no encontrado' });
    }

    const claveHasheada = results.rows[0].clave;

    // Comparar contraseñas
    bcrypt.compare(actual, claveHasheada, (err, esCorrecta) => {
      if (err || !esCorrecta) {
        return response.status(401).send({ mensaje: 'Contraseña actual incorrecta' });
      }

      // Hashear nueva contraseña
      bcrypt.hash(nueva, 10, (err, nuevaHash) => {
        if (err) {
          return response.status(500).send({ mensaje: 'Error al encriptar contraseña' });
        }

        const actualizar = "UPDATE usuario SET clave = $1 WHERE correo = $2";
        pool.query(actualizar, [nuevaHash, correo], (error, results) => {
          if (error) {
            return response.status(400).send({ mensaje: 'No se pudo actualizar la contraseña' });
          }

          return response.status(200).send({ mensaje: 'Contraseña actualizada correctamente' });
        });
      });
    });
  });
};

//--------------------------------------------------------------Recursos--------------------------------------------------------------

const misRecursos = (request, response) => {
  const { correo } = request.query;

  const query = "SELECT * FROM recurso as r, usuario as u, tema as t WHERE t.id_tema = r.id_tema and u.correo = r.correo and r.correo = $1"; 

  pool.query(query, [correo], (error, results) => {
    if (error) {
      console.log(error);
      return response.status(400).send({ error: 'Error en la consulta' });
    }

    response.status(200).send(results.rows);
  });
};


const temas = (request, response) => {
  const query = "SELECT * FROM tema";
  pool.query(query, (error, results) => {
      if(error){
          response.status(400);
          console.log(error)
      }
      response.status(201).send(results.rows);
  });
};

const publicarRecurso = (request, response) => {
  const { titulo, descripcion, estado, fecha, url, id_tema, correo} = request.body;
  const query = "INSERT INTO recurso (titulo, descripcion, estado, fecha, url, id_tema, correo) VALUES ('"
    +titulo+"','"
    +descripcion+"','"
    +estado+"',"
    +"NOW(),'"
    +url+"','"
    +id_tema+"','"
    +correo+"')";
  pool.query(query, (error, results) => {
      if (error) {
        console.log(error)
      } else
      response.status(201).send({mensaje: 'Registrado'})
      //response.status(201).send()
    })
};

const recursosRecientes = (request, response) => {
  const query = "SELECT * FROM recurso as r, usuario as u, tema as t WHERE t.id_tema = r.id_tema and u.correo = r.correo and r.estado = true ORDER BY fecha DESC LIMIT 5;";
  pool.query(query, (error, results) => {
      if(error){
          response.status(400);
          console.log(error)
      }
      response.status(201).send(results.rows);
  });
};

const recursosEnProgreso = (request, response) => {
  const query = "SELECT * FROM recurso as r, usuario as u, tema as t WHERE t.id_tema = r.id_tema and u.correo = r.correo and r.estado = false ORDER BY fecha ASC;";
  pool.query(query, (error, results) => {
      if(error){
          response.status(400);
          console.log(error)
      }
      response.status(201).send(results.rows);
  });
};

const publicarAdmin = (request, response) => {
    const { id_recurso } = request.body;
    const actualizar = "UPDATE recurso SET estado = true WHERE id_recurso = $1";
    pool.query(actualizar, [id_recurso], (error, results) => {
      if (error) {
        return response.status(400).send({ mensaje: 'No se pudo actualizar el estado' });
      }
        
      return response.status(200).send({ mensaje: 'Estado actualizado correctamente' });
    });
  };


const publicarTema = (request, response) => {
  const {titulo_tema, descripcion_tema} = request.body;
  const query = "INSERT INTO tema (titulo_tema, descripcion_tema) VALUES ($1, $2)";

  pool.query(query, [titulo_tema, descripcion_tema], (error, results) => {
      if (error) {
        console.log(error)
      } else
      response.status(201).send({mensaje: 'Registrado'})
      //response.status(201).send()
    })
}

const guardarFavorito = (request, response) => {
    const { id_usuario, id_recurso } = request.body;
    const query = "INSERT INTO favorito (id_usuario, id_recurso) VALUES ($1, $2)";
    pool.query(query, [id_usuario, id_recurso], (error, results) => {
      if (error) {
        return response.status(400).send({ mensaje: 'No se pudo guardar el estado' });
      }
        
      return response.status(200).send({ mensaje: 'Estado actualizado correctamente' });
    });
  };

const eliminarAdmin = (request, response) => {
  const {id_recurso}  = request.body; 
  const query = "DELETE from recurso where id_recurso = $1";
  pool.query(query, [id_recurso], (error, results) => {
      if(error){
          response.status(400);
          console.log(error)
      }
      response.status(201).send({mensaje: 'Eliminado'});
  });
}

const recursosFavoritos = (request, response) => {
  const { correo } = request.query;
  const query = "SELECT * FROM recurso as r, usuario as u, tema as t, favorito as f WHERE t.id_tema = r.id_tema and r.estado = true and u.correo = r.correo and r.id_recurso = f.id_recurso and f.id_usuario = $1"; 
  pool.query(query, [correo], (error, results) => {
    if (error) {
      console.log(error);
      return response.status(400).send({ error: 'Error en la consulta' });
    }
    response.status(200).send(results.rows);
  });
};


const recursosAceptados = (request, response) => {
  const { correo } = request.query;
  const query = "SELECT * FROM recurso as r, usuario as u, tema as t WHERE r.id_tema = t.id_tema and r.estado = true and r.correo = u.correo and r.id_recurso NOT IN (SELECT f.id_recurso FROM recurso as r, usuario as u, tema as t, favorito as f  WHERE t.id_tema = r.id_tema and u.correo = r.correo and r.id_recurso = f.id_recurso and f.id_usuario = $1)";
  pool.query(query, [correo], (error, results) => {
      if(error){
          response.status(400);
          console.log(error)
      }
      response.status(201).send(results.rows);
  });
};

const borrarFavorito = (request, response) => {
  const {id_usuario, id_recurso}  = request.body; 
  const query = "DELETE from favorito where id_usuario = $1 and id_recurso = $2";
  pool.query(query, [id_usuario, id_recurso], (error, results) => {
      if(error){
          response.status(400);
          console.log(error)
      }
      response.status(201).send({mensaje: 'Eliminado'});
  });
}
  

module.exports = {
  registro,
  cambiarContrasena,
  misRecursos,
  temas,
  publicarRecurso,
  recursosRecientes,
  recursosEnProgreso,
  publicarAdmin,
  publicarTema,
  recursosAceptados,
  guardarFavorito,
  eliminarAdmin,
  recursosFavoritos,
  borrarFavorito
}