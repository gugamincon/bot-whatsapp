const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/* Z-API */

const INSTANCE_ID = "3EFEDC731077E241C94E020CDDF3D26F";
const TOKEN = "41C20838289CB5BB5756B42E";
const CLIENT_TOKEN = "Fe75f077cfe7a4a2a8c1a6452291d25c1S";

/* MERCADO PAGO */

const MP_TOKEN = "APP_USR-4446818023835508-031317-88cda509e534d03ef2db36f5f338b942-1279924665"; // 

/* MEMÓRIA */

let clientes = {};

/* TESTE */

app.get("/", (req, res) => {
  res.send("BOT ONLINE 🚀");
});

/* ENVIAR MSG */

async function enviarMensagem(phone, msg) {
  await axios.post(
    `https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-text`,
    {
      phone: phone,
      message: msg,
    },
    {
      headers: {
        "Client-Token": CLIENT_TOKEN,
      },
    }
  );
}

/* WEBHOOK WHATSAPP */

app.post("/webhook", async (req, res) => {
  try {
    let phone = req.body.phone || req.body.from || "";
    phone = phone.replace("@c.us", "");

    const nome = req.body.senderName || "";
    const mensagem = req.body.text?.message?.toLowerCase() || "";

    if (!clientes[phone]) {
      clientes[phone] = { etapa: "inicio" };
    }

    /* INICIO */

    if (
      mensagem.includes("oi") ||
      mensagem.includes("ola") ||
      mensagem.includes("olá")
    ) {
      await enviarMensagem(
        phone,
        `Olá ${nome}, tudo bem?

Eu sou assistente virtual da GM soluções financeiras.

Vou te explicar como funciona 👇`
      );

      setTimeout(async () => {
        await enviarMensagem(
          phone,
          `✨ PROCESSO LIMPA NOME ✨

📌 Você envia:
• Nome completo
• CPF

📆 Lista semanal
⏳ Prazo: até 10 dias úteis

✔ Serasa
✔ Boa Vista
✔ CENPROT

⚠ Não quita dívida
⚠ Não garante crédito`
        );
      }, 3000);

      setTimeout(async () => {
        await enviarMensagem(
          phone,
          `Você entendeu?

1️⃣ Sim, continuar
2️⃣ Tenho dúvidas`
        );
      }, 8000);

      clientes[phone].etapa = "menu";
    }

    /* MENU */

    else if (clientes[phone].etapa === "menu") {
      if (mensagem === "1") {
        await enviarMensagem(
          phone,
          `Perfeito! 👇

Escolha um plano:

💳 1️⃣ Parcelado (3x de 250)
💰 2️⃣ À vista (300)`
        );

        clientes[phone].etapa = "plano";
      } else {
        await enviarMensagem(
          phone,
          `Sem problemas 😊

Atendimento humano:
📞 19974113636

Ou continue por aqui:

1️⃣ Continuar`
        );
      }
    }

    /* PLANO */

    else if (clientes[phone].etapa === "plano") {
      if (mensagem === "1") {
        clientes[phone].valor = 250;
      } else if (mensagem === "2") {
        clientes[phone].valor = 300;
      } else {
        await enviarMensagem(phone, "Digite 1 ou 2");
        return;
      }

      await enviarMensagem(phone, "Digite seu nome completo:");
      clientes[phone].etapa = "nome";
    }

    /* NOME */

    else if (clientes[phone].etapa === "nome") {
      clientes[phone].nome = mensagem;

      await enviarMensagem(phone, "Agora digite seu CPF:");
      clientes[phone].etapa = "cpf";
    }

    /* CPF */

    else if (clientes[phone].etapa === "cpf") {
      clientes[phone].cpf = mensagem;

      const valor = clientes[phone].valor;

      const pagamento = await axios.post(
        "https://api.mercadopago.com/v1/payments",
        {
          transaction_amount: valor,
          payment_method_id: "pix",
          description: "Limpa Nome GM",
          payer: {
            email: `${phone}@gm.com`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${MP_TOKEN}`,
            "X-Idempotency-Key": `${phone}-${Date.now()}`,
          },
        }
      );

      const dadosPix =
        pagamento.data.point_of_interaction.transaction_data;

      const copiaecola = dadosPix.qr_code;
      const qrBase64 = dadosPix.qr_code_base64;

      /* IMAGEM PIX */

      await axios.post(
        `https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-image`,
        {
          phone: phone,
          image: `data:image/png;base64,${qrBase64}`,
          caption: `💳 PAGAMENTO PIX

Valor: R$ ${valor}

Escaneie o QR Code`,
        },
        {
          headers: {
            "Client-Token": CLIENT_TOKEN,
          },
        }
      );

      /* COPIA E COLA */

      await enviarMensagem(
        phone,
        `📋 PIX COPIA E COLA:

${copiaecola}`
      );

      clientes[phone].pagamento = pagamento.data.id;
      clientes[phone].etapa = "aguardando";
    }
  } catch (e) {
    console.log("ERRO WEBHOOK:", e.response?.data || e.message);
  }

  res.sendStatus(200);
});

/* WEBHOOK PAGAMENTO */

app.post("/pagamento", async (req, res) => {
  console.log("WEBHOOK MP:", req.body);

  try {
    const paymentId = req.body?.data?.id || req.body?.id;

    if (!paymentId) return res.sendStatus(200);

    const consulta = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_TOKEN}`,
        },
      }
    );

    if (consulta.data.status === "approved") {
      for (let phone in clientes) {
        if (clientes[phone].pagamento == paymentId) {
          await enviarMensagem(
            phone,
            `✅ Pagamento aprovado!

Nome: ${clientes[phone].nome}
CPF: ${clientes[phone].cpf}

Seu nome foi enviado para análise.

⏳ Prazo: até 10 dias úteis`
          );
        }
      }
    }
  } catch (e) {
    console.log("ERRO PAGAMENTO:", e.response?.data || e.message);
  }

  res.sendStatus(200);
});

/* SERVIDOR */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});