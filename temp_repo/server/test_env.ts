async function test() {
  const url3 = 'https://api.minimax.io/v1/chat/completions';
  await fetch(url3, { method: 'POST' }).then(r => console.log('3:', r.status));
}
test();
