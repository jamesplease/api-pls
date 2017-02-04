# API Pls Example

This project demonstrates how to use API Pls in your own project. There's not
much here, and that's because API Pls is intended to be lightweight.

There are three things worth nothing:

#### .plsrc

This is one way to pass options into API Pls.

#### The resources directory

This is where you put your resource models. You can configure this location in
`.plsrc`.

#### The npm scripts

If you open up `package.json`, you'll see three scripts related to API Pls:

1. `npm run migrate` - This builds migrations based on the resource models you
  have defined. You'll need to do this one time before you can start up the API.
2. `npm run reset` - This resets the database you've specified by wiping all of
  the data inside of it. This lets you start anew.
3. `npm run` - Start up the API webserver.

That's all there is to it!
