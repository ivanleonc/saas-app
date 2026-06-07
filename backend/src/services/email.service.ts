import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: Number(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER || 'tu_usuario',
        pass: process.env.SMTP_PASS || 'tu_contraseña',
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string, tempPassword?: string): Promise<void> {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173/login';
    
    // Plantilla HTML básica (idealmente se extrae a otro archivo o se usa Handlebars/Pug)
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Bienvenido a nuestro SaaS, ${name}!</h2>
        <p>Tu cuenta ha sido creada exitosamente y has sido invitado a unirte a una organización.</p>
        
        ${tempPassword ? 
          `<div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;">Tu contraseña temporal es: <strong>${tempPassword}</strong></p>
            <p style="margin: 5px 0 0; font-size: 0.9em; color: #666;">Te recomendamos cambiarla tan pronto inicies sesión.</p>
          </div>` 
          : ''
        }
        
        <p>Inicia sesión aquí: <a href="${loginUrl}" style="color: #2563eb; font-weight: bold;">${loginUrl}</a></p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: '"SaaS App" <noreply@tus-saas.com>',
        to,
        subject: '¡Bienvenido a la plataforma!',
        html: htmlContent,
      });
    } catch (error) {
      console.error('[EmailService] Error enviando correo de bienvenida:', error);
      // Para un MPV se loguea; más adelante se puede meter en una cola de reintentos (BullMQ).
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Recuperación de Contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
        </div>
        
        <p style="font-size: 0.9em; color: #666;">El enlace expirará en 15 minutos.</p>
        <p style="font-size: 0.9em; color: #666;">Si no realizaste esta solicitud, puedes ignorar este correo.</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: '"SaaS App Seguridad" <security@tus-saas.com>',
        to,
        subject: 'Instrucciones para restablecer tu contraseña',
        html: htmlContent,
      });
    } catch (error) {
      console.error('[EmailService] Error enviando correo de reseteo:', error);
    }
  }
}

// Inyección y exportación Singleton
export const emailService = new EmailService();