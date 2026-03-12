const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/* Z-API */

const INSTANCE_ID = "3EFEDC731077E241C94E020CDDF3D26F";
const TOKEN = "41C20838289CB5BB5756B42E";
const CLIENT_TOKEN = "Fe75f077cfe7a4a2a8c1a6452291d25c1S";

/* MERCADO PAGO */

const MP_TOKEN = "TEST-1002279802964854-031022-80408f67684e26f7d070ac34a0e85c30-1279924665";

/* MEMÓRIA */

let clientes = {};

/* TESTE SERVIDOR */

app.get("/", (req,res)=>{
res.send("BOT ONLINE 🚀");
});

/* ENVIAR TEXTO */

async function enviarMensagem(phone,msg){

await axios.post(
`https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-text`,
{
phone: phone,
message: msg
},
{
headers:{
"Client-Token": CLIENT_TOKEN
}
}
);

}

/* ENVIAR BOTÕES */

async function enviarBotoes(phone,texto,botoes){

await axios.post(
`https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-buttons`,
{
phone: phone,
message: texto,
buttonList: botoes
},
{
headers:{
"Client-Token": CLIENT_TOKEN
}
}
);

}

/* WEBHOOK WHATSAPP */

app.post("/webhook", async (req,res)=>{

try{

let phone = req.body.phone || req.body.from || "";
phone = phone.replace("@c.us","");

const nome = req.body.senderName || "";

/* CAPTURA TEXTO OU BOTÃO */

const mensagem =
req.body.text?.message?.toLowerCase() ||
req.body.buttonReply?.id ||
req.body.buttonResponse?.id ||
"";

if(!phone){
return res.sendStatus(200);
}

if(!clientes[phone]){
clientes[phone]={etapa:"inicio"};
}

/* INICIO */

if(mensagem.includes("oi") || mensagem.includes("ola") || mensagem.includes("olá")){

await enviarMensagem(phone,
`Olá ${nome}, tudo bem?

Eu sou assistente virtual da GM Soluções Financeiras.

Vou te mandar na próxima mensagem um texto explicando quase tudo sobre o nosso processo.

Mas fique à vontade para perguntar depois 👍`
);

setTimeout(async ()=>{

await enviarMensagem(phone,
`✨ PROCESSO LIMPA NOME ✨

Quer limpar seu nome de forma rápida e segura?

📌 Como funciona?

Você envia:

• Nome completo
• CPF
• Comprovante PIX

📆 Listas enviadas semanalmente
⏳ Prazo: 10 dias úteis

✔ Serasa
✔ Boa Vista
✔ CENPROT

⚠ Importante

• Não quita dívida
• Remove dos órgãos de crédito
• Não garante crédito`
);

},5000);

setTimeout(async ()=>{

await enviarBotoes(
phone,
"Você entendeu até aqui?",
[
{ id:"sim", label:"✅ Podemos continuar" },
{ id:"duvida", label:"❓ Tenho dúvidas" }
]
);

},45000);

clientes[phone].etapa="menu";

}

/* MENU */

else if(clientes[phone].etapa=="menu"){

if(mensagem=="sim"){

await enviarBotoes(
phone,
"Escolha um plano:",
[
{ id:"parcelado", label:"💳 Parcelado 3x de 250" },
{ id:"avista", label:"💰 À vista 300" }
]
);

clientes[phone].etapa="plano";

}

else{

await enviarMensagem(phone,
`Sem problemas 👍

Se quiser continuar depois é só escrever:

CONTINUAR`
);

}

}

/* ESCOLHA PLANO */

else if(clientes[phone].etapa=="plano"){

if(mensagem=="parcelado"){
clientes[phone].valor=250;
}

if(mensagem=="avista"){
clientes[phone].valor=300;
}

await enviarMensagem(phone,"Me envie seu nome completo");

clientes[phone].etapa="nome";

}

/* PEGAR NOME */

else if(clientes[phone].etapa=="nome"){

clientes[phone].nome = mensagem;

await enviarMensagem(phone,"Agora envie seu CPF");

clientes[phone].etapa="cpf";

}

/* CPF */

else if(clientes[phone].etapa=="cpf"){

clientes[phone].cpf = mensagem;

const valor = clientes[phone].valor;

/* CRIAR PIX */

const pagamento = await axios.post(
"https://api.mercadopago.com/v1/payments",
{
transaction_amount: valor,
payment_method_id: "pix",
description: "Processo Limpa Nome",
payer:{
email:`cliente${phone}@gmail.com`
}
},
{
headers:{
Authorization:`Bearer ${MP_TOKEN}`,
"X-Idempotency-Key": `${phone}-${Date.now()}`
}
}
);

const pix = pagamento.data.point_of_interaction.transaction_data.qr_code;

await enviarMensagem(phone,
`💳 Pagamento via PIX

Valor: R$ ${valor}

Copie e cole este código no seu banco:

${pix}

Após pagar envie o comprovante aqui 👍`
);

clientes[phone].pagamento = pagamento.data.id;

clientes[phone].etapa="aguardando";

}

}catch(e){

console.log("ERRO:",e.response?.data || e.message);

}

res.sendStatus(200);

});

/* WEBHOOK PAGAMENTO */

app.post("/pagamento", async (req,res)=>{

try{

const pagamento = req.body.data.id;

for(let phone in clientes){

if(clientes[phone].pagamento == pagamento){

await enviarMensagem(phone,
`✅ Pagamento confirmado!

Obrigado pela preferência.

Nome: ${clientes[phone].nome}
CPF: ${clientes[phone].cpf}

Seu nome entrou na lista.

Prazo até 10 dias úteis.`
);

}

}

}catch(e){

console.log(e);

}

res.sendStatus(200);

});

/* PORTA */

const PORT = process.env.PORT || 10000;

app.listen(PORT,()=>{
console.log("Servidor rodando 🚀");
});