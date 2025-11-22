"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const activity_service_1 = require("../services/activity.service");
const error_middleware_1 = require("../middleware/error.middleware");
class ActivityController {
}
exports.ActivityController = ActivityController;
_a = ActivityController;
ActivityController.getTaskHistory = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { taskId } = req.params;
    const history = await activity_service_1.activityService.getTaskHistory(taskId);
    res.status(200).json({
        success: true,
        data: history
    });
});
//# sourceMappingURL=activity.controller.js.map