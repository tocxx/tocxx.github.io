let config = JSON.parse(localStorage.getItem("bst-config"));
let match;
let pool;

for (let match of config.matches) {
  if (
    !match.p1 ||
    !match.p2 ||
    (match.winner && match.loser && match.loser != match.winner)
  )
    continue;
  let p1 = config.players.find((p) => p.id == match.p1.id);
  let p2 = config.players.find((p) => p.id == match.p2.id);
  $("#slMatch").append(
    `<div class="form-check"><input class="form-check-input matchRadio" type="radio" name="radioLeft" id="slm${match.id}" value="${match.id}"><label class="form-check-label" for="slm${match.id}">${p1.display_name} vs ${p2.display_name}</label></div>`
  );
}

$(document).on("click", ".matchRadio", (e) => {
  setCurrentMatch(Number(e.target.value));
});

function setCurrentMatch(id) {
  match = config.matches.find((m) => m.id == id);
  pool = config.pools.find((p) => p.matchIds.includes(match.id));
  localStorage.setItem("bst-currentMatch", JSON.stringify(match));
  localStorage.setItem("bst-currentPool", JSON.stringify(pool));
  $("#p1").html(config.players.find((p) => p.id === match.p1.id).display_name);
  $("#p2").html(config.players.find((p) => p.id === match.p2.id).display_name);
}
