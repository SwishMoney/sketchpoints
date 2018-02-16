const mongo = require('mongodb');
const moment = require('moment');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const usersSeed = require('./data/users.json');

const MongoClient = mongo.MongoClient;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/sketchpoints';
const shouldReseedUsers = process.argv[2] === '--withUsers' ? true : false;

function getRandomItem(items) {
  const index = _.random(0, items.length - 1);
  return items[index];
}

(async () => {
  try {
    const db = await MongoClient.connect(mongoUrl);
    console.log(`Connected to ${mongoUrl}`);
    const usersCollection = db.collection('users');

    // Users
    if (shouldReseedUsers) {
      await usersCollection.remove({});
      const usersWithPasswords = usersSeed.map(user => {
        user.passwordHash = bcrypt.hashSync('testing1', 12);
        user.permissions = {
          canDoSomething: true
        };
        user.createdDate = moment.utc().toISOString();
        return user;
      });
      const usersResult = await usersCollection.insertMany(usersWithPasswords);
    }
    const users = await usersCollection.find({}).toArray();
    console.log(`${shouldReseedUsers ? 'Created' : 'Found'} ${users.length} users.`);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  console.log('Done!');
  process.exit(0);
})();
