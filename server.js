import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ===== CONFIG =====
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
const BOT_NOTIFY_URL = process.env.BOT_NOTIFY_URL || "";
const BOT_NOTIFY_TOKEN = process.env.BOT_NOTIFY_TOKEN || "";

// cache simples para evitar processar o mesmo pagamento muitas vezes
const processedPayments = new Set();

// ===== ROTAS BÁSICAS =====
app.get("/", (req, res) => {
  res.status(200).send("Servidor online");
});

app.get("/webhook/mercadopago", (req, res) => {
  res.status(200).send("Webhook ativo");
});

// ===== FUNÇÕES =====
function extractPaymentId(body) {
  if (body?.data?.id) {
    return String(body.data.id);
  }

  if (body?.resource) {
    return String(body.resource);
  }

  return null;
}

async function getMercadoPagoPayment(paymentId) {
  if (!MP_ACCESS_TOKEN) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado");
  }

  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao consultar pagamento ${paymentId}: HTTP ${response.status} - ${JSON.stringify(data)}`
    );
  }

  return data;
}

async function notifyBotApproved(payment) {
  if (!BOT_NOTIFY_URL) {
    console.log("⚠️ BOT_NOTIFY_URL não configurado. Pagamento aprovado, mas sem notificação ao bot.");
    return;
  }

  const payload = {
    source: "mercadopago_webhook",
    payment_id: String(payment.id),
    status: payment.status,
    status_detail: payment.status_detail || null,
    external_reference: payment.external_reference || null,
    transaction_amount: payment.transaction_amount || null,
    payer_email: payment.payer?.email || null,
    payer_first_name: payment.payer?.first_name || null,
    payer_last_name: payment.payer?.last_name || null,
    date_approved: payment.date_approved || null,
    live_mode: payment.live_mode === true,
    raw_payment: payment,
  };

  const headers = {
    "Content-Type": "application/json",
  };

  if (BOT_NOTIFY_TOKEN) {
    headers["Authorization"] = `Bearer ${BOT_NOTIFY_TOKEN}`;
  }

  const response = await fetch(BOT_NOTIFY_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Falha ao notificar bot: HTTP ${response.status} - ${text}`
    );
  }

  console.log("✅ Bot notificado com sucesso:", text);
}

// ===== WEBHOOK POST =====
app.post("/webhook/mercadopago", async (req, res) => {
  console.log("📩 Webhook recebido!");
  console.log("📦 Dados recebidos:", JSON.stringify(req.body, null, 2));

  // responde imediatamente pro Mercado Pago
  res.status(200).send("OK");

  try {
    const paymentId = extractPaymentId(req.body);

    if (!paymentId) {
      console.log("❌ Sem payment_id");
      return;
    }

    console.log("💰 Payment ID:", paymentId);

    // evita duplicidade simples em memória
    if (processedPayments.has(paymentId)) {
      console.log(`⚠️ Pagamento ${paymentId} já processado anteriormente. Ignorando duplicado.`);
      return;
    }

    console.log("🔎 Consultando pagamento no Mercado Pago...");
    const payment = await getMercadoPagoPayment(paymentId);

    console.log("📄 Pagamento consultado com sucesso:");
    console.log(JSON.stringify({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      transaction_amount: payment.transaction_amount,
      external_reference: payment.external_reference,
      live_mode: payment.live_mode,
      date_approved: payment.date_approved,
    }, null, 2));

    if (payment.live_mode !== true) {
      console.log("⚠️ Pagamento não está em modo produção. Ignorando.");
      return;
    }

    if (payment.status !== "approved") {
      console.log(`⏳ Pagamento ${paymentId} ainda não aprovado. Status atual: ${payment.status}`);
      return;
    }

    console.log(`✅ Pagamento ${paymentId} aprovado!`);

    // marca como processado antes de notificar
    processedPayments.add(paymentId);

    await notifyBotApproved(payment);

    console.log(`🎉 Fluxo finalizado com sucesso para pagamento ${paymentId}`);
  } catch (err) {
    console.error("❌ Erro ao processar webhook:", err);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook rodando na porta ${PORT}`);
});
