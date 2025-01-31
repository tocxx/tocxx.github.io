let config = JSON.parse(localStorage.getItem("bst-config"));
let match = JSON.parse(localStorage.getItem("bst-currentMatch"));
let result = JSON.parse(localStorage.getItem("bst-currentResult"));

if (result) {
  let winner = "TIE";
  if (result.p1 > result.p2) winner = match.p1.name;
  if (result.p2 > result.p1) winner = match.p2.name;
  $("#winner").html(winner);
  console.log(match.p1.name);
  $("#p1").html(match.p1.name);
  $("#p2").html(match.p2.name);
  $("#score1").html(result.p1);
  $("#score2").html(result.p2);
}
