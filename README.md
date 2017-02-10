# api-pls

[![Travis build status](http://img.shields.io/travis/jmeas/api-pls.svg?style=flat)](https://travis-ci.org/jmeas/api-pls)
[![Test Coverage](https://codeclimate.com/github/jmeas/api-pls/badges/coverage.svg)](https://codeclimate.com/github/jmeas/api-pls)

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

Install api-pls into your project using [npm](https://www.npmjs.com/).

```
npm install api-pls --save
```

This package comes with a programmatic interface as well as a command line tool.

#### Programmatic API

The module exports a constructor, `ApiPls`.

##### `ApiPls( options )`

Returns an instance of ApiPls. Valid options are:

| Option | Default | Description |
|--------|---------|-------------|
|**resourcesDirectory**| ./resources |A string that is the location of your resource models.|
|**databaseUrl**|      |The URL of the database to connect to.|
|**connectWithSsl**| true | Whether or not to use SSL to connect to the database.|
|**port**| 5000 | The port to start the webserver on.|

##### `apiPls.migrate()`

Builds the migrations from the resource models in `resourcesDirectory`, and then
runs the migrations on the database.

##### `apiPls.start()`

Starts the web server. Typically you'll want to run the migrations before doing
this to make sure that the database is up-to-date.

##### `apiPls.dangerouslyResetDatabase()`

Removes all tables, and therefore, all of the data, from the database. This can
be useful for testing. Be careful out there.

#### Static Methods

These are methods that are attached to the `ApiPls` constructor. If you're
writing libraries, plugins, or extensions to api-pls, then you might find these
useful. Otherwise, you may never use them.

##### `ApiPls.loadResourceModels( resourcesDirectory )`

Loads all of the resource models from `resourcesDirectory`, which is a string
that is the directory to load from.

##### `ApiPls.normalizeModel( resourceModel )`

Accepts a `resourceModel`, such as one returned from
`ApiPls.loadResourceModels()`, and formats it into a normalized tree. If you're
writing custom code to work with resource models, then this can make that
easier for you.

##### `ApiPls.validateResourceModel( resourceModel )`

Accepts a `resourceModel`, and determines if it is valid or not. If you're
writing custom logic around resource models, then this can be useful to catch
errors in user-input resource models early on.

#### Example Programmatic Usage

```js
import ApiPls from 'api-pls';

const apiPls = new ApiPls({
  DATABASE_URL: process.ENV.DATABASE_URL,
})

// Run our migrations, then starts our server.
apiPls.migrate()
  .then(() => apiPls.start());
```

#### CLI API

The name of the CLI program is `pls`. The rest of this guide assumes that
`pls` is on your path. If you've installed it locally into a project, then
you will need to call it from within an
[npm script](https://docs.npmjs.com/misc/scripts#path).

#### Commands

| Command          | Description                                   |
|----------------- |---------------------------------------------  |
| reset-database   |  Removes all tables from the database         |
| migrate          |  Builds, then applies, migrations             |
| start            |  Starts up the API webserver.                 |

#### CLI Flags

All of the options may also be specified in `.plsrc`, if you would prefer. You
may also specify the `DATABASE_URL` in a `.env` file in the directory that you
call this command from.

| Flags            | Default     | Description                                 |
|----------------- |-------------|---------------------------------------------|
| -h, --help       | N/A         | View all the commands from the command line |
| -v, --version    | N/A         | Display the version of api-pls              |
| -d, --database   |             | Specify the database URL                    |
| -p, --port       | 5000        | Configure the port of the webserver         |
| -r, --resources  | ./resources | Set the directory of your resources         |
| -s, --ssl        | true        | Whether or not to connect to the DB with SSL|
| --silent         | N/A         | Disable logging                             |
| --verbose        | N/A         | Enable verbose logging                      |

#### Example CLI Usage

The following example turns off SSL, sets the port to be 6000, and sets the
resource directory.

```sh
pls start -p 6000 -s false -r ./my-resources
```

### JSON API Feature Support

This project only partially supports JSON API. Features currently supported are:

- [x] CRUD'ing resources
- [x] Attributes
- [x] Meta
- [x] Consistent errors
- [x] Sparse fieldsets
- [ ] Sorting
- [x] Pagination
- [ ] Filtering
- [ ] Links
- [ ] Relations
  - [ ] One-to-one
  - [x] Many-to-one (limited supported)
  - [ ] Many-to-many
  - [ ] Relationship endpoints (`/v1/:resource/relationships/:related`)
  - [ ] Related endpoints (`/v1/:resource/:related`)

### Acknowledgements

[Tyler Kellen](https://github.com/tkellen) for his work on
[Endpoints](https://github.com/endpoints/endpoints) (which inspired me to write
this) and for our many conversations about REST.

[Eric Valadas](https://github.com/ericvaladas) for helping plan the API and
implementation of this library.
