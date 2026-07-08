const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id: "AWQqsWQCjkaOmxXvjTvsV2EEfbnbFAmIXJWCLeGqr-sE27hEUxJaJuNdpLS0rFRbeL-qm6veKhA9QZS9",
  client_secret: "EONlmTcduQykwniMlr1GAvXCSy4boGNVDIQ89OY5DN_FRHbBg7kI1UwnhPpE4ve6IE2mbV18V5M29RR1",
});

module.exports = paypal;
