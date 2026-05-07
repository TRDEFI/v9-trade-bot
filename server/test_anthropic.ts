await fetch("https://api.minimax.chat/v1/chat/completions", {
  method: "POST",
  headers: { "Authorization": "Bearer 123" },
  body: "{}"
}).then(async r => console.log(await r.text()))
