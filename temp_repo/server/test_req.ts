async function run() {
const res = await fetch("https://api.minimax.chat/v1/chat/completions", { method: 'POST', headers: { 'Authorization': 'Bearer 123', 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'minimax-text-01', messages: [{role: 'user', content: 'test'}]}) });
console.log(1, res.status, await res.text());
}
run();
