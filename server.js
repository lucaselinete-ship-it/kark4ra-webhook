import express from "express";

const app = express();
app.use(express.json());

// 🔥 ROTA TESTE (pra evitar 404)
app.get("/", (req, res) => {
  res.send("Servidor online");
});

// 🔥 ROTA GET (UptimeRobot)
app.get("/webhook/mercadopago", (req, res) => {
  res.status(200).send("Webhook ativo");
});

// 🔥 ROTA POST (Mercado Pago)
app.post("/webhook/mercadopago", async (req, res) => {
  console.log("📩 Webhook recebido!");

  // RESPONDE IMEDIATO (ESSENCIAL)
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Webhook rodando na porta ${PORT}`);
});
