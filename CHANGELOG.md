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
