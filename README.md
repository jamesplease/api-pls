# API Pls

[![Travis build status](http://img.shields.io/travis/jmeas/api-pls.svg?style=flat)](https://travis-ci.org/jmeas/api-pls)

This tool enables you to effortlessly create
[JSON API](http://jsonapi.org/)-compliant APIs.

### Motivation

It can be time consuming to put together an application with a robust backend.
This tool is intended to speed up that process considerably.

Simply define resource models (in JSON) and this tool will automatically:

✓ Configure a database for you  
✓ Set up a web server that adheres to JSON API for interactions with those resources  
✓ Create and run migrations for you when you change your resource models  
✓ Manage database backups  

This project is a work in progress; only the first two of those items are
functioning, and only partially so.

### Technologies Used

The only supported database is currently
[PostgreSQL](https://www.postgresql.org/). The webserver is written
in [Node.js](https://nodejs.org/en/) using
[Express](https://github.com/expressjs/express).

### Running the Example

#### Prerequisites

- [Node.js](https://nodejs.org/en/) v7+
- a [PostgreSQL database](#setting-up-a-database)

#### Getting Started

Clone this project. Then, navigate to the root of the directory and install
the Node dependencies:

```sh
npm install
```

Next, create a file in the root of this project called `.env`. Add the following
line to the file, replacing the database URL with your own:

```sh
DATABASE_URL='postgres://user@example.com:5432/example'
```

**Warning: Each time that you run the example, the database specified will be
completely wiped.**

Next, you'll need to create resource models. These are the definitions that
describe what tables and endpoints are created for you.

There are two examples already created for you in the `/examples/resources`
directory: `transaction` and `category`. Review those, and make changes as
you see fit. For now, the documentation for a resource model is contained
within those example files.

You're now ready to start the example.

Run `npm run example` to get it running. Once it's up, navigate your browser
to `localhost:5000` to begin CRUD'ing.

### FAQ

#### How can I start a PostgreSQL database to run the example?

To run the example, you'll need a PostgreSQL database URL. It is recommended
that you create a database specifically for testing this tool.

_Be careful, because on start up the example will wipe the database that you
use._

This is performed to ensure that there are no conflicts between existing tables
and newly-added tables when the application bootstraps your database.

My preference is to create a free [Heroku](heroku.com) app, and then set up a
free version of
[Heroku's PostgreSQL add-on](https://elements.heroku.com/addons/heroku-postgresql).
This provides you with 10,000 rows and 20 connections for free: more than enough
than what you'll need to try out the example.

You can also set up a database locally on your machine. This will differ
slightly between operating systems. I recommend searching
[StackOverflow](stackoverflow.com) for the best solution for your OS.

#### Why did I get an error when I ran the example?

If the error is:

```
Unhandled rejection TypeError: Cannot read property '0' of undefined
```

then this is a known issue. The offending tool is careen, which is what is
used to run migrations. It seems to have a 30-50% chance of failing when the
example is run, and
[I'm still investigating the cause](https://github.com/jmeas/api-pls/issues/16).

If the error is something else, then please
[open an issue](https://github.com/jmeas/api-pls/issues/new?title=Error+on+start+up).

#### Why is the automatic server reloading throwing an error?

[This is also a known issue.](https://github.com/jmeas/api-pls/issues/31)

### Acknowledgements

Many thanks goes to [Tyler Kellen](https://github.com/tkellen) for his work on
[Endpoints](https://github.com/endpoints/endpoints) (which inspired me to write
this) and for our many conversations about REST.
