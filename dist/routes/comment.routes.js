"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.put('/:id', comment_controller_1.CommentController.updateComment);
router.delete('/:id', comment_controller_1.CommentController.deleteComment);
exports.default = router;
//# sourceMappingURL=comment.routes.js.map