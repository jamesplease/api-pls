const path = require('path');
const request = require('supertest');
const app = require('../../../../packages/api-pls-express-server/app');
const getDb = require('../../../../packages/api-pls-postgres-adapter/database');
const wipeDatabase = require('../../../../packages/api-pls-postgres-adapter/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource GET (many) many-to-many (host)', function() {
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

      const expectedData = [
        {
          type: 'pizzas',
          id: '1',
          attributes: {
            name: 'cheese',
            size: 'small'
          },
          relationships: {
            toppings: {
              data: [
                {id: '1', type: 'toppings'},
                {id: '2', type: 'toppings'},
              ],
              links: {
                self: '/v2/pizzas/1/relationships/toppings',
                related: '/v2/pizzas/1/toppings'
              }
            }
          }
        },
        {
          type: 'pizzas',
          id: '2',
          attributes: {
            name: 'pepperoni',
            size: '3'
          },
          relationships: {
            toppings: {
              data: [
                {id: '1', type: 'toppings'},
                {id: '2', type: 'toppings'},
                {id: '3', type: 'toppings'},
              ],
              links: {
                self: '/v2/pizzas/2/relationships/toppings',
                related: '/v2/pizzas/2/toppings'
              }
            }
          }
        },
        {
          type: 'pizzas',
          id: '3',
          attributes: {
            name: 'white',
            size: '1'
          },
          relationships: {
            toppings: {
              data: [
                {id: '1', type: 'toppings'},
              ],
              links: {
                self: '/v2/pizzas/3/relationships/toppings',
                related: '/v2/pizzas/3/toppings'
              }
            }
          }
        }
      ];

      const expectedLinks = {
        self: '/v2/pizzas',
        first: '/v2/pizzas?page[number]=1',
        last: '/v2/pizzas?page[number]=1',
        next: null,
        prev: null
      };

      await applyMigrations(options);
      await seed('topping', toppingSeeds);
      await seed('pizza', pizzaSeeds);
      await seed('pizza_topping', pizzaToppingSeeds);
      return request(app(options))
        .get('/v2/pizzas')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .then();
    });
  });
});
