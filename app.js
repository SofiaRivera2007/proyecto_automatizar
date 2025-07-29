const express = require('express')
const app = express()
const port = 3000

//-------------------------------APIS para funciones-------------------------------
const api = require('./apis/funciones');

//-------------------------------Tokens-------------------------------
const jwt = require('jsonwebtoken')
require('dotenv').config();

//-------------------------------Encriptar clave-------------------------------
const bcrypt = require('bcrypt');



//Conectar la base de datos postgres
const Pool = require('pg').Pool
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "admin",
    database: "admiCR",
    port: 5432
})


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true },{limit: '50mb'}));


//------------------------------------------Validacion de tokens------------------------------------------

function generateAccessToken(user){
    return jwt.sign(user, process.env.SECRET, {expiresIn: '120m'} )
}


function validateToken(req, res, next){
    const accesToken = req.headers['authorization'] || req.query.accesstoken;
    if(!accesToken) res.send('Acceso declinado');
    else
    jwt.verify(accesToken, process.env.SECRET, (err, user)=>{
        if(err){
            res.send('Acces denied, token expired or incorrect')
        }
        else{
            req.user = user;
            next();
        }
    } );

}




//------------------------------------------Pagina inicio------------------------------------------

app.get('/', (req, res) => {
    res.status(200);
    res.sendFile(__dirname + '/pages/landing_page.html');
});

app.get('/registro', (req, res)=>{
    res.status(200);
    res.sendFile(__dirname + '/pages/registro.html');
});
app.get('/prueba2', (req, res)=>{
    res.status(200);
    res.sendFile(__dirname + '/pages/prueba2.html');
});


//------------------------------------------Validacion usuario------------------------------------------

app.get('/principal', validateToken, (req, res) => {
    res.status(200);
    res.sendFile(__dirname + '/pages/principal.html');
});

app.get('/administrador', validateToken, (req, res) => {
    res.status(200);
    res.sendFile(__dirname + '/pages/administrador.html');
});

app.get('/mis_recursos', validateToken, (req, res) => {
    res.status(200);
    res.sendFile(__dirname + '/pages/mis_recursos.html');
});

app.get('/ver_temas', validateToken, (req, res) => {
    res.status(200);
    res.sendFile(__dirname + '/pages/temas.html');
});

app.get('/recursos', validateToken, (req, res) => {
    res.status(200);
    res.sendFile(__dirname + '/pages/recursos.html');
});

app.get('/informativa', validateToken, (req, res) => {
    res.status(200);
    res.sendFile(__dirname + '/pages/informativa.html');
});

app.get('/favoritos', validateToken, (req, res) => {
    res.status(200);
    res.sendFile(__dirname + '/pages/mis_favoritos.html');
});




app.use('/static', express.static(__dirname +'/static'));
const path = require('path');
app.use('/static', express.static(path.join(__dirname, 'static')));


//-------------------------------Llamadas a las apiss-------------------------------

//app.post('/eregistrarse', apis.registrarseEmpresa);
app.post('/registro', api.registro);

app.post('/cambiarContrasena', api.cambiarContrasena);

app.get('/temas', api.temas);

app.get('/traer_mis_recursos', api.misRecursos);

app.post('/publicar_recurso', api.publicarRecurso);

app.get('/recientes_recursos', api.recursosRecientes);

app.get('/recursos_en_progreso', api.recursosEnProgreso);

app.post('/publicar_admin', api.publicarAdmin);

app.post('/publicar_tema', api.publicarTema);

app.get('/recursos_aceptados', api.recursosAceptados);

app.post('/guardar_favorito', api.guardarFavorito);

app.delete('/eliminar_admin', api.eliminarAdmin);

app.get('/traer_favoritos', api.recursosFavoritos);

app.delete('/borrar_favorito', api.borrarFavorito);






app.post('/login', (req, res) => {

    const {correo, clave} = req.body;
    const query = "SELECT * from usuario WHERE correo = $1";
    pool.query(query, [correo], (error, results) => {
      console.log(results.rows.length)
      if(error || results.rows.length == 0){
        res.status(400).send('Error');
      } 
      else {
        var hash = results.rows[0].clave;
        bcrypt.compare(clave, hash, function(err,result){
          if(err){
            res.status(400).send('Error');
          } 
          else if (result) {
            //response.status(201).send(results.rows[0]);

            var user = {username: correo};

            const accesToken = generateAccessToken(user);
    
            var infoUsuario = {
                usuario: results.rows[0],
                token: accesToken
            };
            res.status(201).send(infoUsuario);
            

          } else {
            res.status(400).send('Error');
          }
        })
      }
    });
});



//-------------------------------Levantar el servidor-------------------------------------
app.listen(port, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ port)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

