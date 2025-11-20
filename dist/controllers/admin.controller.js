"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const jobs_1 = require("../jobs");
class AdminController {
}
exports.AdminController = AdminController;
_a = AdminController;
AdminController.getJobsStatus = (0, error_middleware_1.catchAsync)(async (_req, res) => {
    const status = jobs_1.scheduler.getStatus();
    res.status(200).json({
        success: true,
        data: { jobs: status }
    });
});
//# sourceMappingURL=admin.controller.js.map