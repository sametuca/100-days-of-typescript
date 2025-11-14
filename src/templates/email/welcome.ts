export const welcomeEmailTemplate = (name: string, username: string) => {
  return {
    subject: 'DevTracker\'a Hoş Geldiniz! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 DevTracker</h1>
            <p>Task Management System</p>
          </div>
          <div class="content">
            <h2>Merhaba ${name}! 👋</h2>
            <p>DevTracker'a hoş geldiniz! Hesabınız başarıyla oluşturuldu.</p>
            <p><strong>Kullanıcı Adınız:</strong> ${username}</p>
            <p>Artık task'larınızı yönetmeye başlayabilirsiniz.</p>
            <a href="http://localhost:3000/api/v1" class="button">Başlayın</a>
            <p>İyi günler dileriz! 🎉</p>
          </div>
          <div class="footer">
            <p>DevTracker Team</p>
            <p>Bu email otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Merhaba ${name}!
      
      DevTracker'a hoş geldiniz! Hesabınız başarıyla oluşturuldu.
      
      Kullanıcı Adınız: ${username}
      
      Artık task'larınızı yönetmeye başlayabilirsiniz.
      
      İyi günler dileriz!
      
      DevTracker Team
    `
  };
};