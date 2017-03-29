## 0.15.0 (3/28/2017)

**New features**:

- Add `-f, --force` flag to CLI commands

## 0.14.0 (3/28/2017)

**New features**:

- Better relationship support:
  - Resource Models can now define guest relationships
  - Read one and read many supported for all relationship types (guest and host)
- An Express router is now exported to allow you to mount an api-pls API onto
  an existing Express app
- Resource Models can now be defined as `.js` files
- Add `is_authorized` hook to Resource Models to support custom resource-level
  or CRUD-action level authorization
- Add basic support for `additional_condition`, which will facilitate
  the concept of "ownership."

## 0.13.0 (2/18/2017)

**Breaking**:

- Resource Model: `relations` property has been renamed to `relationships`
- Resource Model: `relations.relationship` property has been renamed to `relationship.cardinality`
- Resource Model: `built_in_meta_attributes` property has been renamed to `built_in_meta`
- Root route now lists available CRUD actions as `supported_actions`, rather than just `actions`

**New features**:

- Links objects are now returned from resources
  - Self links
  - Pagination links
  - Relationship links
- Server logs are now more human-readable in dev mode
- The server now logs more useful information in more situations
- Errors when running `sync` now returns better messaging to help you fix the problem
- A `Location` header is returned when resources are created
- Relationships now have a notion of "host" and "guest"
  - One-to-one relationships now have basic support
  - "Guest" relationships can now provide a `name` to their side of the relationship
  - For more details, please read the [Relationships Guide](https://github.com/jmeas/api-pls/wiki/Relationships) on the wiki

**Bug fixes**:

- Many-to-one relationships may now be nullable

## 0.12.0 (2/10/2017)

**Breaking**:

- `pls migrate` has been renamed to `pls sync`
- All fields in Resource Models now use snake case
- Server more strictly adheres to JSON API, both for requests and in responses

**New features**:

- Resource Models are now validated against a JSON Schema definition
- Most fields in Resource Models are sanitized before being input as SQL. The
  only remaining ones are the attribute types, which are direct SQL types. Those
  will be changed soon.
- Programmatic interface introduced
- Resource Models can now be JSON files (previously, only YAML was supported)

## 0.11.0 (2/6/2017)

**Breaking**:

- The structure of the root URL has been updated to better align with JSON API

**New features**:

- Basic support for many-to-one relationships has been added
- Pagination is now supported
- Sparse fields are now supported
- You can now disable certain crud actions with the `actions` option in
  your resource model.
- The webserver will now pretty print logs
- New CLI errors have been added for situations when `pls migrate` fails
- Logs now contain a `reqId`, allowing you to correlate logs with a single
  request

## 0.10.0 (2/6/2017)

**Breaking**:

- `built_in_attributes` has been renamed to `built_in_meta_attributes`
- `updated_at` and `created_at` are now returned under `meta`

**New features**:

- Resource models can now define their own `meta` attributes
- A resource's `meta` can now be managed through the API

## 0.9.0 (2/4/2017)

- Adds ability to configure pls-api through command line flags
