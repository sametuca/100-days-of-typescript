"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordChangedTemplate = void 0;
const passwordChangedTemplate = (name) => {
    return {
        subject: 'Şifreniz Değiştirildi 🔐',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Güvenlik Bildirimi</h1>
          </div>
          <div class="content">
            <h2>Merhaba ${name}!</h2>
            <p>Hesabınızın şifresi başarıyla değiştirildi.</p>
            <div class="warning">
              <strong>⚠️ Dikkat:</strong> Bu işlemi siz yapmadıysanız, derhal bizimle iletişime geçin.
            </div>
            <p>Tarih: ${new Date().toLocaleString('tr-TR')}</p>
            <p>Hesabınızın güvenliği için güçlü bir şifre kullanmanızı öneririz.</p>
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
      
      Hesabınızın şifresi başarıyla değiştirildi.
      
      ⚠️ DIKKAT: Bu işlemi siz yapmadıysanız, derhal bizimle iletişime geçin.
      
      Tarih: ${new Date().toLocaleString('tr-TR')}
      
      DevTracker Team
    `
    };
};
exports.passwordChangedTemplate = passwordChangedTemplate;
//# sourceMappingURL=password-changed.js.map