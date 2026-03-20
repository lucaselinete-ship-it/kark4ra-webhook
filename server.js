app.post("/webhook/mercadopago", async (req, res) => {
  console.log("📩 Webhook recebido!");
  console.log("📦 Dados recebidos:", req.body);

  res.status(200).send("OK");

  try {
    let paymentId = null;

    if (req.body?.data?.id) {
      paymentId = String(req.body.data.id);
    } else if (req.body?.resource) {
      paymentId = String(req.body.resource);
    }

    if (!paymentId) {
      console.log("❌ Sem payment_id");
      return;
    }

    console.log("💰 Payment ID:", paymentId);

    // daqui pra frente:
    // consultar API do Mercado Pago
    // verificar se status = approved
    // entregar DZCoins
  } catch (err) {
    console.error("❌ Erro ao processar webhook:", err);
  }
});
