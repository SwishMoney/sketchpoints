const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/sketchpoints';
const shouldDeleteIndexes = process.argv[2] === '--delete' ? true : false;

(async () => {
  try {
    const db = await MongoClient.connect(mongoUrl);
    console.log(`Connected to ${mongoUrl}`);
    const usersCollection = db.collection('users');

    if (shouldDeleteIndexes) {
      await usersCollection.dropAllIndexes();
      console.log('----- DELETED ALL INDEXES -------');
    }

    // await usersCollection.createIndex(
    //   {
    //     slug: 1,
    //     slugUid: 1
    //   },
    //   {
    //     unique: true,
    //     background: true
    //   }
    // );
    // console.log('Created index on User');
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  console.log('Done!');
  process.exit(0);
})();
