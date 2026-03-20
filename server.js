import express from "express";

const app = express();
app.use(express.json());

// 🔥 GET (para UptimeRobot)
app.get("/webhook/mercadopago", (req, res) => {
  res.status(200).send("Webhook ativo");
});

// 🔥 POST (Mercado Pago)
app.post("/webhook/mercadopago", async (req, res) => {
  console.log("📩 Webhook recebido!");

  // responde IMEDIATO
  res.status(200).send("OK");

  try {
    const body = req.body;
    console.log("📦 Dados:", body);

    const paymentId = body?.data?.id;

    if (!paymentId) return;

    console.log("💰 Payment ID:", paymentId);

  } catch (error) {
    console.error("Erro:", error);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Rodando na porta ${PORT}`);
});
