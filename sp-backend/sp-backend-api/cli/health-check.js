require('isomorphic-fetch');

/*
  Health check for Docker
*/

(async () => {
  let result;
  try {
    result = await fetch(
      'http://localhost:4000/graphql?query=%7B%0A%20%20health%0A%7D'
    );
  } catch (e) {
    console.log('Connection Error', e);
    process.exit(1);
  }

  if (result.status === 200) {
    const body = await result.json();
    if (body && body.data && body.data.health === true) {
      console.log('Health Check OK');
      process.exit(0);
    } else {
      console.log(`Server Returned ${JSON.stringify(body)}`);
      process.exit(1);
    }
  } else {
    console.log(`Received a response ${result.status} from the server.`);
    process.exit(1);
  }
})();
