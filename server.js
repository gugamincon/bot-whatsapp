const express = require("express");

const app = express();
app.use(express.json());

// página principal
app.get("/", (req,res)=>{
res.send("Bot WhatsApp online 🚀");
});

// webhook que recebe mensagens do WhatsApp
app.post("/webhook",(req,res)=>{
console.log("Mensagem recebida:", req.body);
res.send("ok");
});

app.listen(3000, ()=>{
console.log("Servidor rodando");
});