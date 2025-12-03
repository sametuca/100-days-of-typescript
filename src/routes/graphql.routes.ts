import { Router } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { schema } from '../graphql/schema';
import { resolvers } from '../graphql/resolvers';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use('/graphql', 
  authMiddleware,
  graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: process.env.NODE_ENV === 'development',
    customFormatErrorFn: (error) => ({
      message: error.message,
      locations: error.locations,
      stack: error.stack ? error.stack.split('\n') : [],
      path: error.path,
    }),
  })
);

export default router;