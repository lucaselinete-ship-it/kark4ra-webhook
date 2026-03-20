import express from "express";

const app = express();
app.use(express.json());

// 🔥 WEBHOOK MERCADO PAGO
app.post("/webhook/mercadopago", async (req, res) => {
  console.log("📩 Webhook recebido!");

  // ⚠️ RESPONDE IMEDIATO (ESSENCIAL)
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

    // 👉 aqui você pode depois:
    // - consultar Mercado Pago
    // - chamar seu bot
    // - salvar no banco

  } catch (error) {
    console.error("🔥 Erro no webhook:", error);
  }
});

// servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Webhook rodando na porta ${PORT}`);
});
