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

/* VALIDAR CPF */

function validarCPF(cpf){

cpf = cpf.replace(/\D/g,'');

if(cpf.length !== 11) return false;

if(/^(\d)\1+$/.test(cpf)) return false;

let soma = 0;
let resto;

for (let i = 1; i <= 9; i++)
soma += parseInt(cpf.substring(i-1,i)) * (11 - i);

resto = (soma * 10) % 11;

if(resto == 10 || resto == 11) resto = 0;

if(resto != parseInt(cpf.substring(9,10))) return false;

soma = 0;

for (let i = 1; i <= 10; i++)
soma += parseInt(cpf.substring(i-1,i)) * (12 - i);

resto = (soma * 10) % 11;

if(resto == 10 || resto == 11) resto = 0;

if(resto != parseInt(cpf.substring(10,11))) return false;

return true;

}

/* TESTE */

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

async function enviarBotoes(phone,msg,botoes){

await axios.post(
`https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-buttons`,
{
phone: phone,
message: msg,
buttons: botoes
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
const mensagem = (req.body.text?.message || "").toLowerCase();

if(!clientes[phone]){
clientes[phone]={etapa:"inicio"};
}

/* INICIO */

if(mensagem.includes("oi") || mensagem.includes("ola") || mensagem.includes("olá")){

await enviarMensagem(phone,
`Olá ${nome} tudo bem?

Eu sou assistente virtual da GM soluções financeiras.

Vou te explicar como funciona nosso processo.`
);

setTimeout(async ()=>{

await enviarMensagem(phone,
`✨ PROCESSO LIMPA NOME ✨

Quer limpar seu nome de forma rápida?

Você envia:

• Nome completo
• CPF
• Comprovante PIX

Prazo médio: 10 dias úteis

✔ Serasa
✔ Boa Vista
✔ CENPROT

⚠ Não quitamos dívidas
⚠ Apenas removemos dos órgãos`
);

},5000);

setTimeout(async ()=>{

await enviarBotoes(phone,"Você entendeu até aqui?",[
{ id:"continuar", label:"Podemos continuar" },
{ id:"duvidas", label:"Tenho dúvidas" }
]);

},45000);

clientes[phone].etapa="menu";

}

/* MENU */

else if(clientes[phone].etapa=="menu"){

if(mensagem.includes("continuar")){

await enviarBotoes(phone,"Escolha seu plano",[
{ id:"parcelado", label:"Parcelado 3x 250" },
{ id:"avista", label:"À vista 300" }
]);

clientes[phone].etapa="plano";

}

}

/* ESCOLHER PLANO */

else if(clientes[phone].etapa=="plano"){

if(mensagem.includes("parcelado")){
clientes[phone].valor = 250;
}else{
clientes[phone].valor = 300;
}

await enviarMensagem(phone,"Envie seu nome completo");

clientes[phone].etapa="nome";

}

/* NOME */

else if(clientes[phone].etapa=="nome"){

clientes[phone].nome = mensagem;

await enviarMensagem(phone,"Agora envie seu CPF (somente números)");

clientes[phone].etapa="cpf";

}

/* CPF */

else if(clientes[phone].etapa=="cpf"){

const cpfDigitado = mensagem.replace(/\D/g,'');

if(!validarCPF(cpfDigitado)){

await enviarMensagem(phone,
`❌ CPF inválido

Envie novamente apenas os números.

Exemplo:
12345678909`
);

return;

}

clientes[phone].cpf = cpfDigitado;

const valor = clientes[phone].valor;

/* GERAR PIX */

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
"X-Idempotency-Key":`${phone}-${Date.now()}`
}
}
);

const pix = pagamento.data.point_of_interaction.transaction_data.qr_code;

await enviarMensagem(phone,
`💳 Pagamento PIX

Valor: R$ ${valor}

Copie e cole no seu banco:

${pix}

Após pagar envie o comprovante 👍`
);

clientes[phone].pagamento = pagamento.data.id;

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

const pagamento = req.body?.data?.id;

for(let phone in clientes){

if(clientes[phone].pagamento == pagamento){

await enviarMensagem(phone,
`✅ Pagamento confirmado!

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
