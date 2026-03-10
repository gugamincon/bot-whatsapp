const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// COLOQUE SEUS DADOS DA ZAPI
const INSTANCE_ID = "3EFEDC731077E241C94E020CDDF3D26F";
const TOKEN = "41C20838289CB5BB5756B42E";

app.get("/", (req, res) => {
  res.send("Bot WhatsApp online 🚀");
});

app.post("/webhook", async (req, res) => {

  try {

    cconst phone = req.body.phone || req.body.from;
    const mensagem = req.body.text?.message?.toLowerCase();
    console.log("Telefone", phone);
    console.log("Mensagem recebida:", mensagem);

    let resposta = "";

    if (mensagem === "oi" || mensagem === "ola") {

      resposta = `Olá 👋

Promoção para limpar seu nome

1 - Pagar parcelado
2 - Pagar à vista
3 - Deixar para depois`;

    }

    if (resposta !== "") {

      await axios.post(
        'https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-text',
        {
          phone: phone,
          message: resposta
        }
      );

    }

  } catch (erro) {

    console.log("Erro:", erro);

  }

  res.send("ok");

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});