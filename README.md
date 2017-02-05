# API Pls

[![Travis build status](http://img.shields.io/travis/jmeas/api-pls.svg?style=flat)](https://travis-ci.org/jmeas/api-pls)

API Pls enables you to effortlessly create
[JSON API](http://jsonapi.org/)-compliant APIs.

> Note: this project is a work in progress. It currently functions in a limited manner.

### Motivation

It can be time consuming to put together an application with a robust backend.
Use API Pls to speed up that process considerably.

Instead of writing database and API code within your project, simply define
models, and let this tool do the rest.

API Pls will:

✓ Configure a database for you  
✓ Set up a web server that adheres to JSON API for interactions with those resources  
✓ Create and run migrations for you when you change your resource models   

This project is a work in progress. Resource migrations beyond the initial
set up are currently unsupported.

### Technologies Used

The only supported database is currently
[PostgreSQL](https://www.postgresql.org/). The webserver is written
in [Node.js](https://nodejs.org/en/) using
[Express](https://github.com/expressjs/express).

### Getting Started

Try out [the example project](https://github.com/jmeas/api-pls-example) to see
API Pls in action.

### Installation

Install the `api-pls` CLI.

`npm install api-pls --global`

Next, create a file in the root of your project called `.env`. Add the following
line to the file, replacing the database URL with your own:

```sh
DATABASE_URL='postgres://user@example.com:5432/example'
```

Next, you'll need to create resource models. These are the definitions that
describe what tables and endpoints are created for you. Documentation for
the resource model files is coming soon.

Once you've defined your resources, run `api migrate`. This will generate
database migrations from your resource models, and then run the migrations.

You're now ready to start an API webserver. Run `api start` to start the server.

You can access the API webserver at `localhost:5000`.

Anytime you make changes to your resource models, be sure to run
`pls reset-database` to clear out all of the previous models. Presently,
only the initial migrations are supported.

### Acknowledgements

Many thanks goes to [Tyler Kellen](https://github.com/tkellen) for his work on
[Endpoints](https://github.com/endpoints/endpoints) (which inspired me to write
this) and for our many conversations about REST.
