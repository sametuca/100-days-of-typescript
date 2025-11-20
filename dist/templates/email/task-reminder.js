"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskReminderTemplate = void 0;
const taskReminderTemplate = (name, taskTitle, dueDate) => {
    return {
        subject: `Hatırlatma: ${taskTitle} ⏰`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .task-card { background: white; padding: 20px; border-left: 4px solid #F59E0B; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #F59E0B; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Task Hatırlatması</h1>
          </div>
          <div class="content">
            <h2>Merhaba ${name}!</h2>
            <p>Bir task'ınızın son teslim tarihi yaklaşıyor:</p>
            <div class="task-card">
              <h3>${taskTitle}</h3>
              <p><strong>Son Tarih:</strong> ${dueDate.toLocaleString('tr-TR')}</p>
            </div>
            <a href="http://localhost:3000/api/v1/tasks" class="button">Task'ları Görüntüle</a>
          </div>
          <div class="footer">
            <p>DevTracker Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
      Merhaba ${name}!
      
      Bir task'ınızın son teslim tarihi yaklaşıyor:
      
      Task: ${taskTitle}
      Son Tarih: ${dueDate.toLocaleString('tr-TR')}
      
      DevTracker Team
    `
    };
};
exports.taskReminderTemplate = taskReminderTemplate;
//# sourceMappingURL=task-reminder.js.map