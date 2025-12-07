"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const graphql_1 = require("graphql");
const schema_1 = require("../graphql/schema");
const resolvers_1 = require("../graphql/resolvers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/graphql', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { query, variables } = req.body;
        const result = await (0, graphql_1.graphql)({
            schema: schema_1.schema,
            source: query,
            rootValue: resolvers_1.resolvers,
            variableValues: variables,
        });
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=graphql.routes.js.map