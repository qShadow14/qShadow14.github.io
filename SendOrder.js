const nodemailer = require("nodemailer");
const fs = require("fs");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "YOUR_EMAIL@gmail.com", // Your email
        pass: "YOUR_APP_PASSWORD"      // Use your App Password, not main password
    }
});

async function sendOrderEmail(order) {
    // 1. Prepare Customer Email
    let customerTemplate = fs.readFileSync("customer_template.html", "utf8");
    // ... perform your .replace() logic for customer template ...

    // 2. Prepare Owner Email (different template)
    let ownerTemplate = fs.readFileSync("owner_template.html", "utf8");
    // ... perform your .replace() logic for owner template ...

    // 3. Send to Customer
    await transporter.sendMail({
        from: '"VEXOR Store" <YOUR_EMAIL@gmail.com>',
        to: order.email, // Use the customer's email from the form!
        subject: "Your VEXOR Order Confirmation",
        html: customerTemplate
    });

    // 4. Send to Owner
    await transporter.sendMail({
        from: '"VEXOR System" <YOUR_EMAIL@gmail.com>',
        to: "qshadowqshadow13@email.com",
        subject: "NEW ORDER RECEIVED",
        html: ownerTemplate
    });
}

module.exports = sendOrderEmail;