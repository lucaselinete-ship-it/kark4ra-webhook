const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

app.post("/webhook/mercadopago", async (req, res) => {
    console.log("🔔 Webhook recebido:", req.body);

    try {
        const paymentId = req.body?.data?.id;

        if (!paymentId) {
            return res.sendStatus(200);
        }

        const response = await axios.get(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
                }
            }
        );

        const payment = response.data;

        console.log("💰 Status:", payment.status);

        if (payment.status === "approved") {
            console.log("✅ PAGAMENTO APROVADO");
        }

    } catch (err) {
        console.error("❌ Erro:", err.message);
    }

    res.sendStatus(200);
});

app.get("/", (req, res) => {
    res.send("Webhook rodando 🚀");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
