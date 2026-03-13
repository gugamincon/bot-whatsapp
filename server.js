const express = require("express")
const axios = require("axios")

const app = express()
app.use(express.json())

/* ZAPI */

const INSTANCE_ID = "3EFEDC731077E241C94E020CDDF3D26F"
const TOKEN = "41C20838289CB5BB5756B42E"
const CLIENT_TOKEN = "Fe75f077cfe7a4a2a8c1a6452291d25c1S"

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
buttons: botoes
},
{
headers:{ "Client-Token": CLIENT_TOKEN }
}
)

}

/* WEBHOOK */

app.post("/webhook", async (req,res)=>{

console.log(JSON.stringify(req.body,null,2))

try{

let phone = req.body.phone || req.body.from || ""
phone = phone.replace("@c.us","")

if(!phone) return res.sendStatus(200)

let mensagem = ""

if(req.body.text && req.body.text.message){
mensagem = req.body.text.message.toLowerCase()
}

if(req.body.buttonResponse && req.body.buttonResponse.selectedButtonId){
mensagem = req.body.buttonResponse.selectedButtonId
}

const nome = req.body.senderName || ""

if(!clientes[phone]){
clientes[phone] = { etapa:"inicio" }
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

},8000)

clientes[phone].etapa="menu"

}

/* MENU */

else if(clientes[phone].etapa === "menu"){

if(mensagem === "continuar"){

await enviarBotoes(
phone,
"Escolha um plano",
[
{ id:"parcelado", label:"💳 3x de 250" },
{ id:"avista", label:"💰 À vista 300" }
]
)

clientes[phone].etapa="plano"

}else{

await enviarMensagem(phone,
"Nosso atendimento humano pode demorar um pouco.\n\nDigite *CONTINUAR* quando quiser seguir 👍")

}

}

/* PLANO */

else if(clientes[phone].etapa === "plano"){

if(mensagem === "parcelado"){
clientes[phone].valor = 250
}

if(mensagem === "avista"){
clientes[phone].valor = 300
}

await enviarMensagem(phone,"Me envie seu *nome completo*")

clientes[phone].etapa="nome"

}

/* NOME */

else if(clientes[phone].etapa === "nome"){

clientes[phone].nome = mensagem

await enviarMensagem(phone,"Agora envie seu *CPF*")

clientes[phone].etapa="cpf"

}

/* CPF */

else if(clientes[phone].etapa === "cpf"){

await enviarMensagem(phone,"CPF recebido 👍")

clientes[phone].etapa="fim"

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