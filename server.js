const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req,res)=>{
res.send("Bot WhatsApp online 🚀");
});

app.post("/webhook",(req,res)=>{
console.log("Mensagem recebida:", req.body);
res.send("ok");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
console.log("Servidor rodando na porta " + PORT);
});