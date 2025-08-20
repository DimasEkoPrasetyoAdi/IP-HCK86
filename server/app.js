const express = require('express')
const app = express()
const TripController = require ('./controllers/TripController')
const authentication =require ('./middlewares/authentication')
const authorization = require ('./middlewares/authorization')
const FavoriteController = require('./controllers/FavouriteController')
const AuthController = require('./controllers/AuthController')
const errorHandler = require('./middlewares/errorHandler')
const {Trip, FavouritePlace} = require ('./models/')


app.use(express.urlencoded({extended: true}))
app.use(express.json())

// Debug: Log all routes
console.log('Registering routes...');

app.post('/api/auth/register', (req, res, next) => {
  console.log('POST /api/auth/register hit');
  AuthController.register(req, res, next);
});

app.post('/api/auth/login', AuthController.login)

app.get('/api/auth/me', authentication.auth(), AuthController.me)
app.post('/api/trips', authentication.auth(), TripController.create)
app.get('/api/trips', authentication.auth(), TripController.getAll)
app.get('/api/trips/:id', authentication.auth(), TripController.getOne);
app.put('/api/trips/:id', authentication.auth(), authorization.authorization(Trip), TripController.update);
app.delete('/api/trips/:id', authentication.auth(), authorization.authorization(Trip), TripController.remove);



app.post('/api/favorites', authentication.auth(), FavoriteController.create);

// Endpoint untuk mendapatkan semua tempat favorit pengguna
app.get('/api/favorites', authentication.auth(), FavoriteController.getAll);

// Endpoint untuk mendapatkan tempat favorit berdasarkan ID
app.get('/api/favorites/:id', authentication.auth(), FavoriteController.getOne);

// Endpoint untuk mengupdate tempat favorit berdasarkan ID
app.put('/api/favorites/:id', authentication.auth(), authorization.authorization(FavouritePlace), FavoriteController.update);

// Endpoint untuk menghapus tempat favorit berdasarkan ID
app.delete('/api/favorites/:id', authentication.auth(), authorization.authorization(FavouritePlace), FavoriteController.remove);

// Error Handler Middleware (harus di akhir)
app.use(errorHandler);

module.exports = app
