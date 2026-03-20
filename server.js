import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// rota raiz opcional
app.get("/", (req, res) => {
  res.status(200).send("Servidor online");
});

// rota GET pro UptimeRobot
app.get("/webhook/mercadopago", (req, res) => {
  res.status(200).send("Webhook ativo");
});

// rota POST do Mercado Pago
app.post("/webhook/mercadopago", async (req, res) => {
  console.log("📩 Webhook recebido!");

  res.status(200).send("OK");

  try {
    const body = req.body;
    console.log("📦 Dados recebidos:", body);

    const paymentId = body?.data?.id;

    if (!paymentId) {
      console.log("❌ Sem payment_id");
      return;
    }

    console.log("💰 Payment ID:", paymentId);

  } catch (error) {
    console.error("🔥 Erro no webhook:", error);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook rodando na porta ${PORT}`);
});
