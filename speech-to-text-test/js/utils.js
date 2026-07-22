const logWin = document.getElementById('log');

function log(msg) {
  console.log(msg);
  const p = document.createElement('p');
  p.textContent = msg;
  logWin.appendChild(p);
}

export { log };
