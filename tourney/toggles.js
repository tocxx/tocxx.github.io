let visible = false,
  selectLeft = document.getElementById("selectLeft"),
  selectRight = document.getElementById("selectRight");

document.addEventListener("keypress", (key) => {
  if (key.key === "i") {
    toggleDialog();
  }
});

function toggleDialog() {
  let dialog = document.getElementById("dialog");
  if (visible) {
    dialog.style.visibility = "hidden";
    visible = false;
  } else {
    dialog.style.visibility = "visible";
    visible = true;
  }
}