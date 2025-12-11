const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send welcome email to new users
 */
exports.sendWelcomeEmail = async (email, name) => {
    try {
        await resend.emails.send({
            from: 'Zeene <onboarding@resend.dev>',
            to: email,
            subject: 'Welcome to Zeene!',
            html: `
        <h1>Welcome to Zeene, ${name}!</h1>
        <p>Thank you for joining our sneaker community.</p>
        <p>Start shopping for the latest and greatest sneakers!</p>
        <p>Best regards,<br>The Zeene Team</p>
      `
        });
        console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
    }
};

/**
 * Send order confirmation email
 */
exports.sendOrderConfirmation = async (email, order) => {
    try {
        await resend.emails.send({
            from: 'Zeene <orders@resend.dev>',
            to: email,
            subject: `Order Confirmation - ${order.orderNumber}`,
            html: `
        <h1>Order Confirmed!</h1>
        <p>Thank you for your order.</p>
        <h2>Order #${order.orderNumber}</h2>
        <p><strong>Total:</strong> $${order.totals.total.toFixed(2)}</p>
        <p>We'll send you another email when your order ships.</p>
        <p>Best regards,<br>The Zeene Team</p>
      `
        });
        console.log(`✅ Order confirmation sent to ${email}`);
    } catch (error) {
        console.error('❌ Error sending order confirmation:', error);
    }
};

/**
 * Send order status update email
 */
exports.sendOrderStatusUpdate = async (email, order) => {
    try {
        await resend.emails.send({
            from: 'Zeene <orders@resend.dev>',
            to: email,
            subject: `Order ${order.status} - ${order.orderNumber}`,
            html: `
        <h1>Order Status Update</h1>
        <p>Your order #${order.orderNumber} is now <strong>${order.status}</strong>.</p>
        ${order.tracking?.trackingNumber ? `<p>Tracking: ${order.tracking.trackingNumber}</p>` : ''}
        <p>Best regards,<br>The Zeene Team</p>
      `
        });
        console.log(`✅ Status update sent to ${email}`);
    } catch (error) {
        console.error('❌ Error sending status update:', error);
    }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, resetURL) => {
    try {
        await resend.emails.send({
            from: 'Zeene <security@resend.dev>',
            to: email,
            subject: 'Password Reset Request',
            html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>This link expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Zeene Team</p>
      `
        });
        console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
        console.error('❌ Error sending password reset:', error);
    }
};
