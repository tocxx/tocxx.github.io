const ws = new WebSocket("ws://localhost:2948/socket");
let host = "not found";
let players = [];
let map = "";
let state = "";
let lobbyState = "";
let leftLUID = null;
let rightLUID = null;
let config = JSON.parse(localStorage.getItem("bst-config"));
let currentMatch = JSON.parse(localStorage.getItem("bst-currentMatch"));
let result = JSON.parse(localStorage.getItem("bst-currentResult"));
let rightLink;
let leftLink;

if (currentMatch) {
  leftLink = config.players.find((p) => p.id === currentMatch.p1.id);
  rightLink = config.players.find((p) => p.id === currentMatch.p2.id);
  $("#sl-lp-name").html(leftLink.display_name);
  $("#sl-rp-name").html(rightLink.display_name);
  $("#lp-name").html(leftLink.display_name);
  $("#rp-name").html(rightLink.display_name);
  refreshStandings();
}

ws.addEventListener("message", (msg) => {
  const data = JSON.parse(msg.data);
  if (data._type === "handshake") {
    host = data.LocalUserName;
    let badge = document.getElementById("connectionBadge");
    badge.innerHTML = "Connected";
    badge.setAttribute("class", "badge text-bg-success");
  }
  if (data._type === "event") {
    switch (data._event) {
      case "RoomJoined":
        state = "Lobby joined";
        break;
      case "RoomLeaved":
        state = "Lobby left";
        players = [];
        updateRadios();
        break;
      case "RoomState":
        lobbyState = data.RoomState;
        break;
      case "PlayerJoined":
        console.log(data);
        players[data.PlayerJoined.LUID] = {
          id: data.PlayerJoined.LUID,
          name: data.PlayerJoined.UserName,
        };
        updateRadios();
        break;
      case "PlayerLeaved":
        delete players[data.PlayerLeaved.LUID];
        updateRadios();
        refreshPlayers();
        break;
      case "Score":
        updateScore(data.Score);
        break;
      default:
        console.log(data);
    }
  }
});

$(document).on("keypress", (key) => {
  if (key.key === "r") {
    refreshStandings();
  }
});

$(document).on("click", ".radioLeft", (e) => {
  console.log("click left");
  leftLUID = e.target.value;
  refreshPlayers();
});

$(document).on("click", ".radioRight", (e) => {
  console.log("click right");
  rightLUID = e.target.value;
  refreshPlayers();
});

function updateRadios() {
  let leftInputs = "";
  let rightInputs = "";
  players.forEach((player) => {
    leftInputs += `<div class="form-check"><input class="form-check-input radioLeft" type="radio" id="rl${player.id}" value="${player.id}"><label class="form-check-label" for="rl${player.id}">${player.name}</label></div>`;
    rightInputs += `<div class="form-check"><input class="form-check-input radioRight" type="radio" id="rr${player.id}" value="${player.id}"><label class="form-check-label" for="rr${player.id}">${player.name}</label></div>`;
  });
  $("#selectLeft").html(leftInputs);
  $("#selectRight").html(rightInputs);
}

function updateScore(Score) {
  if (Score.LUID == leftLUID) {
    $("#lp-acc").html(
      (Math.round(Score.Accuracy * 100 * 100) / 100).toFixed(2) + "%"
    );
    $("#lp-combo").html(Score.Combo);
    $("#lp-miss").html(Score.MissCount);
  }
  if (Score.LUID == rightLUID) {
    $("#rp-acc").html(
      (Math.round(Score.Accuracy * 100 * 100) / 100).toFixed(2) + "%"
    );
    $("#rp-combo").html(Score.Combo);
    $("#rp-miss").html(Score.MissCount);
  }
}

function refreshPlayers() {
  $("#sl-lp-name").html(leftLink.display_name);
  $("#sl-rp-name").html(rightLink.display_name);
  $("#lp-name").html(leftLink.display_name);
  $("#rp-name").html(rightLink.display_name);
}

function refreshStandings() {
  let classlist = [
    "standing",
    "standingW",
    "bi-slash-circle",
    "bi-circle-fill",
  ];
  if (result.p1.length == 1 && $("#l1").hasClass("bi-slash-circle"))
    $("#l1").toggleClass(classlist);
  if (result.p1.length == 2) {
    if ($("#l1").hasClass("bi-slash-circle")) $("#l1").toggleClass(classlist);
    if ($("#l2").hasClass("bi-slash-circle")) $("#l2").toggleClass(classlist);
  }
  if (result.p1.length == 3) {
    if ($("#l1").hasClass("bi-slash-circle")) $("#l1").toggleClass(classlist);
    if ($("#l2").hasClass("bi-slash-circle")) $("#l2").toggleClass(classlist);
    if ($("#l3").hasClass("bi-slash-circle")) $("#l3").toggleClass(classlist);
  }
  if (result.p2.length == 1 && $("#r1").hasClass("bi-slash-circle"))
    $("#r1").toggleClass(classlist);
  if (result.p2.length == 2) {
    if ($("#r1").hasClass("bi-slash-circle")) $("#r1").toggleClass(classlist);
    if ($("#r2").hasClass("bi-slash-circle")) $("#r2").toggleClass(classlist);
  }
  if (result.p2.length == 3) {
    if ($("#r1").hasClass("bi-slash-circle")) $("#r1").toggleClass(classlist);
    if ($("#r2").hasClass("bi-slash-circle")) $("#r2").toggleClass(classlist);
    if ($("#r3").hasClass("bi-slash-circle")) $("#r3").toggleClass(classlist);
  }
}
