import { Router, Request, Response } from 'express';
import { graphql } from 'graphql';
import { schema } from '../graphql/schema';
import { resolvers } from '../graphql/resolvers';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/graphql', 
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { query, variables } = req.body;
      const result = await graphql({
        schema,
        source: query,
        rootValue: resolvers,
        variableValues: variables,
      });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;