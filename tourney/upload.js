$("#uploadConfig").on("change", (event) => {
  let reader = new FileReader();
  reader.onload = onReaderLoadConfig;
  reader.readAsText(event.target.files[0]);
});

function onReaderLoadConfig(event) {
  config = JSON.parse(event.target.result);
  saveConfig();
}
function saveConfig() {
  $("#downloadConfig")
    .attr(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(JSON.stringify(config))
    )
    .attr("download", "TocxxioTourneyConfig.json");
  localStorage.setItem("bst-config", JSON.stringify(config));
}
