const express = require("express")
const axios = require("axios")

const app = express()
app.use(express.json())

/* ZAPI */

const INSTANCE_ID = "3EFEDC731077E241C94E020CDDF3D26F"
const TOKEN = "41C20838289CB5BB5756B42E"
const CLIENT_TOKEN = "Fe75f077cfe7a4a2a8c1a6452291d25c1S"

/* MERCADO PAGO */

const MP_TOKEN = "SEU_TOKEN_MP"

/* MEMÓRIA */

let clientes = {}

/* TESTE */

app.get("/", (req,res)=>{
res.send("BOT ONLINE 🚀")
})

/* ENVIAR TEXTO */

async function enviarMensagem(phone,msg){

await axios.post(
`https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-text`,
{
phone,
message: msg
},
{
headers:{ "Client-Token": CLIENT_TOKEN }
}
)

}

/* ENVIAR BOTÕES */

async function enviarBotoes(phone,texto,botoes){

await axios.post(
`https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-buttons`,
{
phone,
message: texto,
buttonList: botoes
},
{
headers:{ "Client-Token": CLIENT_TOKEN }
}
)

}

/* VALIDAR CPF */

function validarCPF(cpf){

cpf = cpf.replace(/\D/g,'')

if(cpf.length !== 11) return false

if(/^(\d)\1+$/.test(cpf)) return false

let soma = 0
let resto

for(let i=1;i<=9;i++)
soma = soma + parseInt(cpf.substring(i-1,i)) * (11-i)

resto = (soma * 10) % 11

if(resto == 10 || resto == 11) resto = 0
if(resto != parseInt(cpf.substring(9,10))) return false

soma = 0

for(let i=1;i<=10;i++)
soma = soma + parseInt(cpf.substring(i-1,i)) * (12-i)

resto = (soma * 10) % 11

if(resto == 10 || resto == 11) resto = 0
if(resto != parseInt(cpf.substring(10,11))) return false

return true

}

/* WEBHOOK */

app.post("/webhook", async (req,res)=>{

console.log(JSON.stringify(req.body,null,2))

try{

let phone = req.body.phone || req.body.from || ""
phone = phone.replace("@c.us","")

if(!phone) return res.sendStatus(200)

const nome = req.body.senderName || ""

let mensagem = "";

if(req.body.text && req.body.text.message){
mensagem = req.body.text.message.toLowerCase();
}

if(req.body.buttonResponse && req.body.buttonResponse.selectedButtonId){
mensagem = req.body.buttonResponse.selectedButtonId;
}

if(!clientes[phone]){
clientes[phone]={etapa:"inicio"}
}

/* INICIO */

if(mensagem === "oi" || mensagem === "ola" || mensagem === "olá"){

await enviarMensagem(phone,
`Olá ${nome} tudo bem?

Eu sou o assistente virtual da GM Soluções Financeiras.`)

setTimeout(async ()=>{

await enviarMensagem(phone,
`✨ PROCESSO LIMPA NOME ✨

Quer limpar seu nome de forma rápida e segura?

📌 Como funciona

Você envia

• Nome completo
• CPF
• Comprovante PIX

📆 Listas enviadas semanalmente
⏳ Prazo médio 10 dias úteis

✔ Serasa
✔ Boa Vista
✔ CENPROT

⚠ Importante

• Não quita dívida
• Remove dos órgãos de crédito
• Não garante crédito`
)

},4000)

setTimeout(async ()=>{

await enviarBotoes(
phone,
"Você entendeu até aqui?",
[
{ id:"continuar", label:"✅ Podemos continuar" },
{ id:"duvida", label:"❓ Tenho dúvidas" }
]
)

},8000);

clientes[phone].etapa="menu"

}

/* MENU */

else if(clientes[phone].etapa=="menu"){

if(mensagem.includes("continuar")){

await enviarBotoes(
phone,
"Escolha um plano",
[
{ id:"parcelado", label:"💳 3x de 250" },
{ id:"avista", label:"💰 À vista 300" }
]
)

clientes[phone].etapa="plano"

}

else{

await enviarMensagem(phone,
"Nosso atendimento humano pode demorar um pouco.\n\nDigite *CONTINUAR* quando quiser seguir 👍")

}

}

/* PLANO */

else if(clientes[phone].etapa=="plano"){

if(mensagem.includes("parcelado")){
clientes[phone].valor = 250
}

if(mensagem.includes("avista")){
clientes[phone].valor = 300
}

await enviarMensagem(phone,"Me envie seu *nome completo*")

clientes[phone].etapa="nome"

}

/* NOME */

else if(clientes[phone].etapa=="nome"){

clientes[phone].nome = mensagem

await enviarMensagem(phone,"Agora envie seu *CPF*")

clientes[phone].etapa="cpf"

}

/* CPF */

else if(clientes[phone].etapa=="cpf"){

if(!validarCPF(mensagem)){

await enviarMensagem(phone,
"❌ CPF inválido\n\nDigite novamente apenas os números")

return res.sendStatus(200)

}

clientes[phone].cpf = mensagem

const valor = clientes[phone].valor

const pagamento = await axios.post(
"https://api.mercadopago.com/v1/payments",
{
transaction_amount: valor,
payment_method_id: "pix",
description: "Limpa Nome GM",
payer:{ email:`cliente${phone}@gmail.com` }
},
{
headers:{
Authorization:`Bearer ${MP_TOKEN}`,
"X-Idempotency-Key":`${phone}-${Date.now()}`
}
}
)

const pix = pagamento.data.point_of_interaction.transaction_data.qr_code

await enviarMensagem(phone,
`💳 PAGAMENTO PIX

Valor: R$ ${valor}

Copie o código abaixo no seu banco:

${pix}

Após pagar envie o comprovante 👍`
)

clientes[phone].pagamento = pagamento.data.id
clientes[phone].etapa="aguardando"

}

}catch(e){

console.log("ERRO:",e.response?.data || e.message)

}

res.sendStatus(200)

})

/* PORTA */

const PORT = process.env.PORT || 10000

app.listen(PORT,()=>{
console.log("Servidor rodando 🚀")
})