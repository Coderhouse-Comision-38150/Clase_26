const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = []; // Almacenamiento de usuarios en memoria
const secret = 'mi_secreto_super_secreto';

// Manejador de registro de usuario
app.post('/register', (req, res) => {
    const { name, password, address } = req.body;

    if (users.some(user => user.name === name)) {
        res.status(400).send('El usuario ya está registrado');
        return;
    }

    const user = { name, password, address };
    users.push(user);

    res.send('Usuario registrado con éxito');
});

// Manejador de inicio de sesión
app.post('/login', (req, res) => {
    const { name, password } = req.body;

    const user = users.find(user => user.name === name && user.password === password);

    if (!user) {
        res.status(401).send('Credenciales incorrectas');
        return;
    }

    const token = jwt.sign({ name }, secret, { expiresIn: '1m' });

    res.json({ token });
});

// Middleware para verificar el token en cada solicitud protegida
function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).send('No se proporcionó un token de autenticación');
        return;
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send('Token de autenticación no válido');
    }
}

// Manejador de la página principal
app.get('/', verifyToken, (req, res) => {
    res.send(`Bienvenido, ${req.user.name}!`);
});

// Manejador de la página de datos del usuario
app.get('/user', verifyToken, (req, res) => {
    const user = users.find(user => user.name === req.user.name);

    if (!user) {
        res.status(404).send('Usuario no encontrado');
        return;
    }

    res.render('user', { user });
});

// Manejador de cierre de sesión
app.post('/logout', (req, res) => {
    res.redirect('/login');
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Ocurrió un error en el servidor');
});

// Inicio del servidor
app.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});