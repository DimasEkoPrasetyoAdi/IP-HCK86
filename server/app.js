if(process.env.NODE_ENV !== 'production'){
    require("dotenv").config();
}
const dotenv = require('dotenv')

dotenv.config()

const express = require('express')
const app = express()
const TripController = require ('./controllers/TripController')
const authentication =require ('./middlewares/authentication')
const authorization = require ('./middlewares/authorization')
const AuthController = require('./controllers/AuthController')
const FavouriteTripController = require('./controllers/FavouriteTripController')
const { Op } = require('sequelize')
const errorHandler = require('./middlewares/errorHandler')
const LocationController = require('./controllers/LocationController')
const {Trip, FavouritePlace} = require ('./models/')
const cors = require ('cors')


app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())


app.post('/api/register', AuthController.register);
app.post('/api/login', AuthController.login)
app.post('/api/google-login', AuthController.googleLogin)

app.get('/api/me', authentication.auth(), AuthController.me)
app.post('/api/trips', authentication.auth(), TripController.create)
app.get('/api/trips', authentication.auth(), TripController.getAll)
app.get('/api/trips/:id', authentication.auth(), TripController.getOne);
app.put('/api/trips/:id', authentication.auth(), authorization.authorization(Trip), TripController.update);
app.delete('/api/trips/:id', authentication.auth(), authorization.authorization(Trip), TripController.remove);

// Public share by slug (no auth)
app.get('/api/public/trips/:slug', async (req,res,next)=>{
	try {
		const { Trip } = require('./models');
		const trip = await Trip.findOne({ where:{ shareSlug: req.params.slug }});
		if(!trip){ const e=new Error('Trip not found'); e.name='NotFound'; throw e; }
		res.json({
			id: trip.id,
			title: trip.title,
			city: trip.city,
			startDate: trip.startDate,
			endDate: trip.endDate,
			itinerary: trip.itinerary,
			weather: trip.weather,
			interest: trip.interest,
			shareSlug: trip.shareSlug
		});
	} catch(err){ next(err); }
});

// Favourite Trips
app.post('/api/favourite-trips', authentication.auth(), FavouriteTripController.add);
app.get('/api/favourite-trips', authentication.auth(), FavouriteTripController.list);
app.delete('/api/favourite-trips/:id', authentication.auth(), FavouriteTripController.remove);




// Geo helper endpoints (protected)
app.get('/api/geo/search', authentication.auth(), LocationController.search)
app.get('/api/geo/provinces', authentication.auth(), LocationController.provinces)
app.get('/api/geo/regencies/:provinceId', authentication.auth(), LocationController.regencies)

// Error Handler Middleware (harus di akhir)
app.use(errorHandler);

module.exports = app
