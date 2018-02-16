import { getConnection as db } from '../services/MongoDB';

const healthCheck = async (root): Promise<Boolean> => {
  const stats = await db().stats();
  return stats.ok === 1;
};

export default {
  Query: {
    health: healthCheck,
  },
};
