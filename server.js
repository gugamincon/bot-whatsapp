const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// COLOQUE SEUS DADOS DA Z-API AQUI
const INSTANCE_ID = "3EFEDC731077E241C94E020CDDF3D26F";
const TOKEN = "41C20838289CB5BB5756B42E";

// página inicial
app.get("/", (req,res)=>{
res.send("Bot WhatsApp online 🚀");
});

// webhook que recebe mensagens
app.post("/webhook", async (req,res)=>{

try{

const phone = req.body.phone;
const mensagem = req.body.text?.message?.toLowerCase();

console.log("Mensagem recebida:", mensagem);

let resposta = "";

if(mensagem === "oi" || mensagem === "olá"){

resposta = `Olá 👋

Promoção para limpar seu nome

1️⃣ Pagar parcelado
2️⃣ Pagar à vista
3️⃣ Deixar para depois`;

}

else if(mensagem === "1"){

resposta = `Entrada de R$250

Quando seu nome estiver limpo você paga os outros R$250.

Responda OK para gerar o PIX.`;

}

else if(mensagem === "2"){

resposta = `Pagamento à vista R$300.

Responda OK para gerar o PIX.`;

}

else if(mensagem === "3"){

resposta = `Tudo bem 🙂

Quando quiser limpar seu nome é só mandar mensagem novamente.`;

}

// enviar resposta via Z-API
if(resposta !== ""){

await axios.post(
https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-text,
{
phone: phone,
message: resposta
}
);

}

}catch(error){

console.log("Erro:", error.message);

}

res.send("ok");

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
console.log("Servidor rodando na porta " + PORT);
});