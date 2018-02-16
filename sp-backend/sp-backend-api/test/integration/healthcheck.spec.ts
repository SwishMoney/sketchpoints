import { graphqlQuery } from './helpers/request';

it('should return true from the health check', async () => {
  const query = `
    {
      health
    }
  `;
  const { status, data, errors } = await graphqlQuery({ query });
  expect(status).toBe(200);
  expect(errors).toBeFalsy();
  expect(data).toHaveProperty('health', true);
});
