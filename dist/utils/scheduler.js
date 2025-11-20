"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduler = exports.Scheduler = void 0;
const cron = __importStar(require("node-cron"));
const logger_1 = __importDefault(require("./logger"));
class Scheduler {
    constructor() {
        this.jobs = new Map();
    }
    schedule(job) {
        if (!job.enabled) {
            logger_1.default.info(`Job '${job.name}' is disabled, skipping`);
            return;
        }
        if (!cron.validate(job.schedule)) {
            logger_1.default.error(`Invalid cron schedule for job '${job.name}': ${job.schedule}`);
            return;
        }
        const scheduledTask = cron.schedule(job.schedule, async () => {
            logger_1.default.info(`Running job: ${job.name}`);
            const startTime = Date.now();
            try {
                await job.task();
                const duration = Date.now() - startTime;
                logger_1.default.info(`Job '${job.name}' completed in ${duration}ms`);
            }
            catch (error) {
                logger_1.default.error(`Job '${job.name}' failed:`, error);
            }
        });
        this.jobs.set(job.name, scheduledTask);
        logger_1.default.info(`Job '${job.name}' scheduled: ${job.schedule}`);
    }
    start(jobName) {
        if (jobName) {
            const job = this.jobs.get(jobName);
            if (job) {
                job.start();
                logger_1.default.info(`Started job: ${jobName}`);
            }
        }
        else {
            this.jobs.forEach((job, name) => {
                job.start();
                logger_1.default.info(`Started job: ${name}`);
            });
        }
    }
    stop(jobName) {
        if (jobName) {
            const job = this.jobs.get(jobName);
            if (job) {
                job.stop();
                logger_1.default.info(` Stopped job: ${jobName}`);
            }
        }
        else {
            this.jobs.forEach((job, name) => {
                job.stop();
                logger_1.default.info(` Stopped job: ${name}`);
            });
        }
    }
    getStatus() {
        const status = [];
        this.jobs.forEach((job, name) => {
            status.push({
                name,
                running: job.getStatus() === 'scheduled'
            });
        });
        return status;
    }
}
exports.Scheduler = Scheduler;
exports.scheduler = new Scheduler();
//# sourceMappingURL=scheduler.js.map