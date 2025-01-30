let config = JSON.parse(localStorage.getItem("bst-config"));
if (config) {
  $("#nothing").addClass("visually-hidden");
  setupBracket();
}
function setupBracket() {
  for (let m of config.matches) {
    let div1 = $(`#m${m.id}p1`);
    let div2 = $(`#m${m.id}p2`);
    if (m.p1) {
      div1.html(playerName(m.p1.name));
      if (m.winner === 1) {
        div1.addClass("win");
      }
      if (m.loser === 1) {
        div1.addClass("loss");
      }
    }
    if (m.p2) {
      div2.html(playerName(m.p2.name));
      if (m.winner === 2) {
        div2.addClass("win");
      }
      if (m.loser === 2) {
        div2.addClass("loss");
      }
    }
  }
}

function playerName(name) {
  return `<strong>${name}</strong>`;
}
