const path = require('path');
const request = require('supertest');
const app = require('../../../../server/app');
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
  beforeEach(done => {
    wipeDatabase(db).then(() => done());
  });

  describe('when the request succeeds', () => {
    beforeEach((done) => {
      this.options = {
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

      applyMigrations(this.options)
        .then(() => seed('topping', toppingSeeds))
        .then(() => seed('pizza', pizzaSeeds))
        .then(() => seed('pizza_topping', pizzaToppingSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the resource and its related items', (done) => {
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

      request(app(this.options))
        .get('/v2/toppings/2')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });
});
