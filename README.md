# api-pls

[![Travis build status](http://img.shields.io/travis/jmeas/api-pls.svg?style=flat)](https://travis-ci.org/jmeas/api-pls)

api-pls enables you to effortlessly create
[JSON API](http://jsonapi.org/)-compliant APIs.

> Note: this project is a work in progress. It currently functions in a limited
  manner.

### Motivation

It can be time-consuming to put together an application with a robust backend.
Use api-pls to speed up that process considerably.

Instead of writing database and API code within your project, simply define
models, and let this tool do the rest.

api-pls will:

✓ Configure a database for you  
✓ Set up a web server that adheres to JSON API for interactions with those resources  
✓ ~~Create and run migrations for you when you change your resource models~~   

This project is a work in progress. Resource migrations beyond the initial
set up are currently unsupported.

### Technologies Used

Currently, the only supported database is
[PostgreSQL](https://www.postgresql.org/). The webserver is written
in [Node.js](https://nodejs.org/en/) using
[Express](https://github.com/expressjs/express).

### Getting Started

Try out [the example project](https://github.com/jmeas/api-pls-example) to see
api-pls in action.

### Installation

`api-pls` is a CLI tool. Install it into your project using
[npm](https://www.npmjs.com/).

```
npm install api-pls --save
```

The name of the CLI program is `pls`. The rest of this guide assumes that
`pls` is on your path. If you've installed it locally into a project, then
you will need to call it from within an
[npm script](https://docs.npmjs.com/misc/scripts#path).

### Basic Usage

Create a file in the root of your project called `.env`. Add the following
line to the file, replacing the database URL with your own:

```sh
DATABASE_URL='postgres://user@example.com:5432/example'
```

Next, you'll need to create resource models. These are the definitions that
describe what tables and endpoints are created for you. Place your resource
models in the directory `./resources`.

More complete documentation for the resource model files is coming soon; for
now, refer to the [example project](https://github.com/jmeas/api-pls-example).

Once you've defined your resources, run `pls migrate`. This will generate
database migrations from your resource models, and then run those migrations.

You're now ready to start an API webserver. Run `pls start` to start the server.

You can access the API webserver at `localhost:5000`.

Anytime you make changes to your resource models, be sure to run
`pls reset-database` to clear out all of the previous models. Presently,
only the initial migrations are supported.

### CLI Commands

##### `pls -h`

View all the commands from the command line.

##### `pls -v`

Display the version of api-pls

##### `pls reset-database`

Removes all tables from the database. This is useful if you've made changes to
your resources, and would like them to be reflected on your server.

Eventually, api-pls will support migrating from one state to another, but
not now.

##### `pls migrate`

Builds migrations from your resource models, and then applies them to the
database.

##### `pls start`

Starts up the API webserver.

### CLI Options

All of these options may also be specified in `.plsrc`, if you would prefer.

| Options          | Default     | Description                                 |
|----------------- |-------------|---------------------------------------------|
| -d, --database   |             | Specify the database URL                    |
| -p, --port       | 5000        | Configure the port of the webserver         |
| -r, --resources  | ./resources | Set the directory of your resources         |
| -s, --ssl        | true        | Whether or not to connect to the DB with SSL|

### Example CLI Usage

The following example turns off SSL, sets the port to be 6000, and sets the
resource directory.

```sh
pls start -p 6000 -s false -r ./my-resources
```

### Acknowledgements

Many thanks goes to [Tyler Kellen](https://github.com/tkellen) for his work on
[Endpoints](https://github.com/endpoints/endpoints) (which inspired me to write
this) and for our many conversations about REST.
