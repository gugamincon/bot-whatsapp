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

const nome = req.body.senderName || "amigo";

resposta = `Olá ${nome}, como vai você? 😊

Se você chegou até aqui é porque se interessou no Processo Limpa Nome.

Abaixo vou te explicar melhor 👇

✨ PROCESSO LIMPA NOME ✨

Quer limpar seu nome de forma rápida e segura? Eu faço o Processo Limpa Nome para você.

📌 Como funciona?
Você me envia:
* Nome completo
* CPF
* Comprovante pix que já efetuou o pagamento 

📆 As listas são enviadas toda sexta-feira, então o prazo começa a contar a partir da sexta.
⏳ Prazo: 7 dias úteis

⸻

🔎 O que é limpo?
✔️ Serasa
✔️ Boa Vista
✔️ CENPROT (protestos em cartórios)

⸻

💰 Garantia de êxito
O pagamento é com garantia de resultado em 7 dias úteis.
Caso não seja retirado, seu dinheiro é ressarcido integralmente.

🛡️ Em alguns casos já aconteceu da dívida voltar por queda de liminar no processo.
Nessa situação, você tem 3 meses de garantia e refazemos o processo sem custo.

⸻

⚠️ Importante:
* O processo limpa seu nome, mas não quita a dívida com a instituição.
* Apenas remove dos órgãos de proteção ao crédito citados acima.
* Não garante crédito.
`;
}
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