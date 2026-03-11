const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/* DADOS DA Z-API */

const INSTANCE_ID = "3EFEDC731077E241C94E020CDDF3D26F";
const TOKEN = "41C20838289CB5BB5756B42E";

/* TESTE SERVIDOR */

app.get("/", (req, res) => {
  res.send("Bot WhatsApp rodando 🚀");
});

/* WEBHOOK */

app.post("/webhook", async (req, res) => {

  try {

    const phone = req.body.phone || req.body.from;
    const mensagem = req.body.text?.message?.toLowerCase();

    console.log("Telefone:", phone);
    console.log("Mensagem:", mensagem);

    let resposta = "";

    /* MENU */

    if (
      mensagem?.includes("oi") ||
      mensagem?.includes("ola") ||
      mensagem?.includes("olá")
    ) {

      resposta = `Olá 👋

Promoção para limpar seu nome

De 999 por apenas 499

Escolha uma opção:

1 - Pagar parcelado
2 - Pagar à vista (300 reais)
3 - Deixar para depois`;

    }

    /* PARCELADO */

    else if (mensagem === "1") {

      resposta = `Parcelamento disponível ✅

Entrada de 250 reais
e mais 250 quando seu nome estiver limpo.

Digite 2 para pagar à vista
ou 3 para falar depois.`;

    }

    /* À VISTA */

    else if (mensagem === "2") {

      resposta = `Pagamento à vista 💰

Valor promocional: 300 reais

PIX:

19974113636

Após pagar envie o comprovante aqui.`;

    }

    /* DEPOIS */

    else if (mensagem === "3") {

      resposta = `Tudo bem 👍

Quando quiser limpar seu nome é só chamar aqui.

Estamos à disposição.`;

    }

    /* ENVIAR RESPOSTA */

    if (resposta !== "") {

      await axios.post(
        https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-text,
        {
          phone: phone,
          message: resposta
        }
      );

    }

  } catch (erro) {

    console.log("Erro:", erro);

  }

  res.sendStatus(200);

});

/* PORTA RENDER */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});