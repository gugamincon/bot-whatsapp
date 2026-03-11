const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/* DADOS DA Z-API */

const INSTANCE_ID = "3EFEDC731077E241C94E020CDDF3D26F";
const TOKEN = "41C20838289CB5BB5756B42E";
const CLIENT_TOKEN = "Fe75f077cfe7a4a2a8c1a6452291d25c1S";

/* TESTE SERVIDOR */

app.get("/", (req, res) => {
  res.send("Bot WhatsApp rodando 🚀");
});

/* WEBHOOK */

app.post("/webhook", async (req, res) => {

  try {

    let phone = req.body.phone || req.body.from || req.body.sender || ""; 
    phone = phone.replace("@c.us", "").replace("+", "");
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

    const nome = reg.body.senderName || "tudo bem";

      resposta = 'Ola Tudo bem ${nome}';}



      await axios.post(
'https://api.z-api.io/instances/3EFEDC731077E241C94E020CDDF3D26F/token/41C20838289CB5BB5756B42E/send-text',
{
  phone: phone,
  message: resposta
},
{
  headers: {
    "Client-Token": CLIENT_TOKEN
  }
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