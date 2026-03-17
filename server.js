const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/* Z-API */

const INSTANCE_ID = "3EFEDC731077E241C94E020CDDF3D26F";
const TOKEN = "41C20838289CB5BB5756B42E";
const CLIENT_TOKEN = "Fe75f077cfe7a4a2a8c1a6452291d25c1S";

/* MERCADO PAGO */

const MP_TOKEN = "APP_USR-4446818023835508-031317-88cda509e534d03ef2db36f5f338b942-1279924665";

/* MEMÓRIA CLIENTES */

let clientes = {};

/* TESTE */

app.get("/", (req,res)=>{
res.send("BOT ONLINE 🚀");
});

/* FUNÇÃO ENVIAR WHATSAPP */

async function enviarMensagem(phone,msg){

await axios.post(
'https://api.z-api.io/instances/3EFEDC731077E241C94E020CDDF3D26F/token/41C20838289CB5BB5756B42E/send-text',
{
phone: phone,
message: msg
},
{
headers:{
"Client-Token":CLIENT_TOKEN
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
const mensagem = req.body.text?.message?.toLowerCase();

if(!clientes[phone]){
clientes[phone]={etapa:"inicio"};
}

/* ETAPA INICIO */

if(mensagem.includes("oi") || mensagem.includes("ola") || mensagem.includes("olá")){

await enviarMensagem(phone,
`Olá ${nome} tudo bem?'

Eu sou assistente virtual da GM soluções financeiras.

Vou te mandar na próxima mensagem um texto explicando quase tudo sobre o nosso processo.

Mas fique à vontade para perguntar depois.`
);

setTimeout(async ()=>{

await enviarMensagem(phone,
`✨ PROCESSO LIMPA NOME ✨

Quer limpar seu nome de forma rápida e segura?

📌 Como funciona?
Você envia:

* Nome completo
* CPF

📆 Listas enviadas semanalmente
⏳ Prazo: 10 dias úteis

✔ Serasa
✔ Boa Vista
✔ CENPROT

⚠ Importante

* Não quita dívida
* Remove dos órgãos de crédito
* Não garante crédito`
);

},5000);

setTimeout(async ()=>{

await enviarMensagem(phone,
`Você entendeu até aqui?

1️⃣ Sim podemos continuar
2️⃣ Ainda tenho dúvidas`
);

},45000);

clientes[phone].etapa="menu";

}

/* MENU */

else if(clientes[phone].etapa=="menu"){

if(mensagem.includes("1")){

await enviarMensagem(phone,
`Ótimo!

Vamos para parte que interessa.

Temos dois planos:

💳 Parcelado
3x de 250

💰 À vista
300 reais

Digite:

1️⃣ Parcelado
2️⃣ À vista`
);

clientes[phone].etapa="plano";

}

else{

await enviarMensagem(phone,
`Nosso atendimento humano pode demorar um pouco.
Se quiser pode chama nosso numero para atendimento humano
19974113636

Quando quiser continuar digite:

CONTINUAR`
);

}

}

/* ESCOLHA PLANO */

else if(clientes[phone].etapa=="plano"){

if(mensagem.includes("1")){

clientes[phone].valor=250;

}else{

clientes[phone].valor=300;

}

await enviarMensagem(phone,"Me envie seu nome completo");

clientes[phone].etapa="nome";

}

/* PEGAR NOME */

else if(clientes[phone].etapa=="nome"){

clientes[phone].nome=mensagem;

await enviarMensagem(phone,"Agora envie seu CPF");

clientes[phone].etapa="cpf";

}

/* CPF */

else if(clientes[phone].etapa=="cpf"){

clientes[phone].cpf=mensagem;

const valor = clientes[phone].valor;

/* CRIAR PIX */

console.log("TOKEN MERCADO PAGO:", MP_TOKEN);

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
Authorization: `Bearer ${MP_TOKEN}`,
"X-Idempotency-Key": `${phone}-${Date.now()}`
}
}
);

const dadosPix = pagamento.data.point_of_interaction.transaction_data;

const copiaecola = dadosPix.qr_code;
const qrBase64 = dadosPix.qr_code_base64;

/* ENVIA IMAGEM DO QR CODE */

await axios.post(
`https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-image`,
{
phone: phone,
image: `data:image/png;base64,${qrBase64}`,
caption:`💳 PAGAMENTO VIA PIX

Valor: R$ ${valor}

Escaneie o QR Code acima.`
},
{
headers:{
"Client-Token": CLIENT_TOKEN
}
}
);

/* ENVIA CÓDIGO PIX SEPARADO */

await enviarMensagem(phone,
`📋 PIX COPIA E COLA

${copiaecola}

(segure no código acima e clique em copiar)`
);


clientes[phone].pagamento=pagamento.data.id;

clientes[phone].etapa="aguardando";

}

}catch(e){

console.log(e);

}

res.sendStatus(200);

});

/* WEBHOOK PAGAMENTO */

app.post("/pagamento", async (req,res)=>{

try{

const paymentId = req.body.data.id;

const consulta = await axios.get(
`https://api.mercadopago.com/v1/payments/${paymentId}`,
{
headers:{
Authorization:`Bearer ${MP_TOKEN}`
}
}
);

if(consulta.data.status == "approved"){

for(let phone in clientes){

if(clientes[phone].pagamento == paymentId){

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