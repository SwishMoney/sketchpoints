# SketchPoints API

## Installation

### Local Development

There is a `Dockerfile` included, but the intention is that local development will be done *without* Docker
since the config file is setup only for a production deployment.

#### Dependencies:

  * [Node.js](https://nodejs.org/en/)
  * [MongoDB](https://www.mongodb.com/)
  * `npm run setup`

#### Installation & Running

  * `npm run build-watch`
  * `npm run start-dev`

At this point you'll have a local GraphQL dev server running at:
http://localhost:4000/graphql

You can also access a local GraphiQL instance at:
http://localhost:4000/graphiql

#### Seed the Database

For local development you will want some seed data to get started

  * `npm run seed -- --withUsers` - To reseed users as well. You'll want to do this the first time
  * `npm run seed` - Does not reseed the users collection so previous auth tokens will continue to work

## Running The Tests

The tests use [jest](https://facebook.github.io/jest/).

There are a few unit tests, that can run without any dependencies:

 * `npm test`

The majority of tests are integration tests which require that an instance of
MongoDB is running on the default port of 27017.

 * `npm run test-integration`
