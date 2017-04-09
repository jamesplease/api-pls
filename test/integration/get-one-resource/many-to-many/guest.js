const path = require('path');
const request = require('supertest');
const app = require('../../../../packages/api-pls-express-server/app');
const getDb = require('../../../../lib/database');
const wipeDatabase = require('../../../../lib/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource GET (one) many-to-many (guest)', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(() => {
    return wipeDatabase(db);
  });

  describe('when the request succeeds', () => {
    it('should return a 200 OK, with the resource and its related items', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'many-to-many'),
        apiVersion: 2
      };

      const toppingSeeds = [
        {name: 'cheese'},
        {name: 'marinara'},
        {name: 'pepperoni'}
      ];

      const pizzaSeeds = [
        {name: 'cheese', size: 'small'},
        {name: 'pepperoni', size: '3'},
        {name: 'white', size: '1'}
      ];

      const pizzaToppingSeeds = [
        // Cheese pizza: cheese, marinara
        {pizza_id: '1', topping_id: '1'},
        {pizza_id: '1', topping_id: '2'},
        // pepperoni pizza: cheese, marinara, pepperoni
        {pizza_id: '2', topping_id: '1'},
        {pizza_id: '2', topping_id: '2'},
        {pizza_id: '2', topping_id: '3'},
        // white pizza: cheese
        {pizza_id: '3', topping_id: '1'},
      ];

      const expectedData = {
        type: 'toppings',
        id: '2',
        attributes: {
          name: 'marinara'
        },
        relationships: {
          pizzas: {
            data: [
              {id: '1', type: 'pizzas'},
              {id: '2', type: 'pizzas'},
            ],
            links: {
              self: '/v2/toppings/2/relationships/pizzas',
              related: '/v2/toppings/2/pizzas'
            }
          }
        }
      };

      const expectedLinks = {
        self: '/v2/toppings/2',
      };

      await applyMigrations(options);
      await seed('topping', toppingSeeds);
      await seed('pizza', pizzaSeeds);
      await seed('pizza_topping', pizzaToppingSeeds);
      return request(app(options))
        .get('/v2/toppings/2')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .then();
    });
  });
});
