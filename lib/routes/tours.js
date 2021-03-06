const router = require('express').Router();
const Tour = require('../models/Tour');
const { updateOptions } = require('../utils/mongoose-helpers');
const getWeatherLocation = require('../utils/weather-location');
const api = require('../services/weather-services');

const addWeatherLocation = getWeatherLocation(api);

const check404 = (tour, id) => {
    if(!tour) {
        throw {
            status: 404,
            error: `Tour id ${id} does not exist`
        };
    }
};

module.exports = router
    .post('/', (req, res, next) => {
        Tour.create(req.body)
            .then(tour => res.json(tour))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const { id } = req.params;

        Tour.findById(id)
            .lean()
            .then(tour => {
                check404(tour, id);
                res.json(tour);
            })
            .catch(next);
    })

    .put('/:id', (req, res, next) => {
        const { id } = req.params;

        Tour.findByIdAndUpdate(id, req.body, updateOptions)
            .then(tour => res.json(tour))
            .catch(next);
    })

    .get('/', (req, res, next) => {
        Tour.find(req.query)
            .lean()
            .then(tour => res.json(tour))
            .catch(next);
    })

    .delete('/:id', (req, res, next) => {
        const { id } = req.params;

        Tour.findByIdAndRemove(id)
            .then(removed => res.json({ removed }))
            .catch(next);
    })

    .post('/:id/stops', addWeatherLocation, (req, res, next) => {
        const { id } = req.params;

        Tour.findByIdAndUpdate(id, {
            $push: { stops: req.body }
        }, updateOptions)
            .then(tour => {
                res.json(tour.stops[tour.stops.length - 1]);
            })
            .catch(next);
    })

    .put('/:id/stops/:stopId', (req, res, next) => {
        const { id, stopId } = req.params;
        const { attendance } = req.body;

        Tour.findOneAndUpdate({
            '_id': id, 'stops._id': stopId
        }, {
            $set: { 'stops.$.attendance': attendance }
        }, updateOptions)
            .then(tour => {
                check404(tour, id);
                res.json(tour.stops.find(stop => stop._id == stopId));
            })
            .catch(next);
    })

    .delete('/:id/stops/:stopId', (req, res, next) => {
        const { id, stopId } = req.params;

        Tour.findOneAndUpdate(id, {
            $pull: { 
                stops: { _id: stopId } 
            }
        }, updateOptions)
            .then(updated => {
                check404(updated, id);
                res.json(({ updated }));
            })
            .catch(next);
    });

