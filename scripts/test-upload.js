(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/upload/base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'data:text/plain;base64,SGVsbG8gd29ybGQ=', filename: 'hello.txt', type: 'text/plain' })
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  } catch (e) {
    console.error('ERROR', e);
  }
})();
