import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ===== ROTA TESTE =====
app.get("/", (req, res) => {
  res.status(200).send("Servidor online");
});

// ===== WEBHOOK =====
app.post("/webhook/mercadopago", async (req, res) => {
  console.log("📩 Webhook recebido!");
  console.log("📦 Dados:", req.body);

  res.status(200).send("OK");

  try {
    let paymentId = null;

    if (req.body?.data?.id) {
      paymentId = req.body.data.id;
    } else if (req.body?.resource) {
      paymentId = req.body.resource;
    }

    if (!paymentId) {
      console.log("❌ Sem payment_id");
      return;
    }

    console.log("💰 Payment ID:", paymentId);

  } catch (err) {
    console.error("Erro:", err);
  }
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`🚀 Webhook rodando na porta ${PORT}`);
});
