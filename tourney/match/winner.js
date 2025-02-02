let config = JSON.parse(localStorage.getItem("bst-config"));
let match = JSON.parse(localStorage.getItem("bst-currentMatch"));
let result = JSON.parse(localStorage.getItem("bst-currentResult"));

if (result) {
  let winner = "TIE";
  if (result.p1.length > result.p2.length) winner = match.p1.name;
  if (result.p2.length > result.p1.length) winner = match.p2.name;
  $("#winner").html(winner);
  $("#p1").html(match.p1.name);
  $("#p2").html(match.p2.name);
  $("#score1").html(result.p1.length);
  $("#score2").html(result.p2.length);
}
