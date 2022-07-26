'use strict';

const Path = require('path');
const Hapi = require('@hapi/hapi');
const Hoek = require('@hapi/hoek');
const Ejs = require('ejs');

// Add this below the @hapi/hapi require statement
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);


const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    await server.register({
        plugin: require('hapi-mongodb'),
        options: {
          url: 'mongodb+srv://sohag_mongo:sohagmongo123@cluster0.9k1jgxf.mongodb.net/sample_mflix?retryWrites=true&w=majority',
          settings: {
              useUnifiedTopology: true
          },
          decorate: true
        }
    });

    await server.register(require('@hapi/vision'));

    // html integration
    // server.views({
    //     engines: {
    //         html: {
    //             module: require('handlebars'),
    //             compileMode: 'sync' // engine specific
    //         }
    //     },
    //     compileMode: 'async', // global setting
    //     relativeTo: __dirname,
    //     path: './templates',
    //     layoutPath: './templates/layout',
    //     helpersPath: './templates/helpers'
    // });

    // ejs integration
    server.views({
        engines: { ejs: Ejs },
        relativeTo: __dirname,
        path: './ejs/templates'
    });

    // html view
    server.route({
        method: 'GET',
        path: '/viewPage',
        handler: (req, h) => {
            return h.view('index');
        }
    });

    // ejs view
    server.route({ 
        method: 'GET', 
        path: '/viewEjsPage', 
        handler: async (req, h) => {
            const movie = await req.mongo.db.collection('movies').findOne({});
            return h.view('indexEjs', {movie});
        } 
    });

    // Get all movies
    // server.route({
    //     method: 'GET',
    //     path: '/movies',
    //     handler: (req, h) => {

    //         return 'List all the movies';
    //     }
    // });


    // Get all movies
    server.route({
        method: 'GET',
        path: '/movies',
        handler: async (req, h) => {

        const movie = await req.mongo.db.collection('movies').findOne({});

        return movie;
        }
    });


    server.route({
        method: 'GET',
        path: '/moviesWithOffset',
        handler: async (req, h) => {
    
          const offset = Number(req.query.offset) || 0;
    
          const movies = await req.mongo.db.collection('movies').find({}).sort({metacritic:-1}).skip(offset).limit(20).toArray(); // metacritic is the properties inside movie object, and we want metacritic descending, that's why wrote it as -1
    
          return movies;
        }
    });

    // Get a single movie by id
    server.route({
        method: 'GET',
        path: '/movies/{id}',
        handler: async (req, h) => {
            const id = req.params.id
            const ObjectID = req.mongo.ObjectID;

            const movie = await req.mongo.db.collection('movies').findOne({_id: new ObjectID(id)},{projection:{title:1,plot:1,cast:1,year:1, released:1, imdb:1}}); // here fields inside projection will be shown

            return movie;
        }
    });

    // Add a new movie to the database
    // server.route({
    //     method: 'POST',
    //     path: '/movies',
    //     handler: (req, h) => {

    //         return 'Add new movie';
    //     }
    // });

    // Add a new movie to the database
    server.route({
        method: 'POST',
        path: '/movies',
        handler: async (req, h) => {

            const payload = req.payload

            const status = await req.mongo.db.collection('movies').insertOne(payload);

            return status;
        }
    });

    // // Get a single movie
    // server.route({
    //     method: 'GET',
    //     path: '/movies/{id}',
    //     handler: (req, h) => {

    //         return 'Return a single movie';
    //     }
    // });

    // Update the details of a movie
    // server.route({
    //     method: 'PUT',
    //     path: '/movies/{id}',
    //     handler: (req, h) => {

    //         return 'Update a single movie';
    //     }
    // });

    // Update the details of a movie
    server.route({
        method: 'PUT',
        path: '/movies/{id}',
        options: {
            validate: {
                params: Joi.object({
                    id: Joi.objectId()
                })
            }
        },
        handler: async (req, h) => {
            const id = req.params.id
            const ObjectID = req.mongo.ObjectID;

            const payload = req.payload;

            const status = await req.mongo.db.collection('movies').updateOne({_id: ObjectID(id)}, {$set: payload});

            return status;

        }
    });

    // Delete a movie from the database
    // server.route({
    //     method: 'DELETE',
    //     path: '/movies/{id}',
    //     handler: (req, h) => {

    //         return 'Delete a single movie';
    //     }
    // });

    // Delete the details of a movie
    server.route({
        method: 'DELETE',
        path: '/movies/{id}',
        options: {
            validate: {
                params: Joi.object({
                    id: Joi.objectId()
                })
            }
        },
        handler: async (req, h) => {
            const id = req.params.id
            const ObjectID = req.mongo.ObjectID;

            const payload = req.payload;

            const status = await req.mongo.db.collection('movies').deleteOne({_id: ObjectID(id)});

            return status;

        }
    });   

    // Search for a movie
    server.route({
        method: 'GET',
        path: '/search',
        handler: (req, h) => {

            return 'Return search results for the specified term';
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
}

init();  