let config = JSON.parse(localStorage.getItem("bst-config"));
let picksAndBans = JSON.parse(localStorage.getItem("bst-picksandbans"));
let match = JSON.parse(localStorage.getItem("bst-currentMatch"));
let pool = JSON.parse(localStorage.getItem("bst-currentPool"));
let result = {
  p1: [],
  p2: [],
};
let state = 1;
const categories = [
  { title: "Accuracy", color: "#6cadf0" },
  { title: "Balanced", color: "#61be7d" },
  { title: "Tech", color: "#874dd6" },
  { title: "Speed", color: "#b23c45" },
  { title: "Classic", color: "#f0714f" },
];
const difficulties = [
  { title: "Easy", color: "#008055" },
  { title: "Normal", color: "#1268a1" },
  { title: "Hard", color: "#bd5500" },
  { title: "Expert", color: "#b52a1c" },
  { title: "Expert +", color: "#7646af" },
];
const cardMapcardSkeleton = `
        <div class="col-3">
            <div class="position-relative" style="z-index: 1000">
                <span class="position-absolute top-0 start-50 translate-middle badge rounded-pill" style="background-color: $categoryColor">
                    <h5><strong>$category</strong></h5>
                </span>
            </div>
            <div class="card" style="border-width: 3px;border-color: $categoryColor;background-color: $categoryColor;color: white;">
                <div class="row g-0">
                    <div class="col-4">
                <div class="rounded" style="background-color: $diffColor">
                    <div class="p-2 pb-2">
                        $winpill
                        <img src="$coverImage" class="card-img-top rounded" alt="coverImage" id="$id" />
                    </div>
                    <div class="text-center p-1">
                        <h5>
                            <strong>$diff</strong>
                        </h5>
                    </div>
                </div>
                </div>
                <div class="col">
                <div class="card-body">
                    <h4 class="card-title">$songArtist - $songTitle</h4>
                    <p class="card-text">$description<br>$pickedby</p>
                </div>
                </div>
            </div>
        </div>`;

const winpill1 = `
    <span class="position-absolute top-50 start-50 translate-middle badge w-100" style="background-color: rgb(178, 60, 69)">
        <h5><i class="bi bi-trophy-fill"></i> <strong>$winner</strong></h5>
    </span>`;
const winpill2 = `
    <span class="position-absolute top-50 start-50 translate-middle badge w-100" style="background-color: rgb(108, 173, 240)">
        <h5><i class="bi bi-trophy-fill"></i> <strong>$winner</strong></h5>
    </span>`;

setup();

$(document).on("click", ".map", (e) => {
  let id = e.target.id;
  console.log(id);
  if (state === 1 && !result.p2.includes(id)) {
    result.p1.push(id);
    e.target.parentElement.innerHTML =
      winpill1.replace("$winner", match.p1.name) + e.target.outerHTML;
  }
  if (state === 2 && !result.p2.includes(id)) {
    result.p2.push(id);
    e.target.parentElement.innerHTML =
      winpill2.replace("$winner", match.p2.name) + e.target.outerHTML;
  }
  saveResult();
});
$(document).on("keypress", (key) => {
  if (key.key === "1") {
    state = 1;
  }
  if (key.key === "2") {
    state = 2;
  }
});

async function setup() {
  $("#p1").html(match.p1.name);
  $("#p2").html(match.p2.name);
  await compileMaps();
}

async function compileMaps() {
  clearMapCols();
  await addMap(picksAndBans.map1, 1);
  await addMap(picksAndBans.map2, 1);
  await addMap(picksAndBans.map3, 1);
  await addMap(picksAndBans.map4, 1);
  await addMap(picksAndBans.map5, 2);
  await addMap(picksAndBans.map6, 2);
  await addMap(picksAndBans.map7, 2);
}

async function addMap(id, row) {
  let map = pool.maps.find((m) => m.id == id);
  if (!map) return;
  await $.ajax(`https://api.beatsaver.com/maps/id/${map.id}`)
    .done((data) => {
      let version = data.versions.find((v) => v.state === "Published");
      if (!version) {
        console.log(`Couldn't find a published version of map ${map.id}`);
        return;
      }
      let mapcard = cardMapcardSkeleton
        .replace("$categoryColor", categories[map.category].color)
        .replace("$category", categories[map.category].title)
        .replace("$categoryColor", categories[map.category].color)
        .replace("$categoryColor", categories[map.category].color)
        .replace("$diffColor", difficulties[map.diff].color)
        .replace("$coverImage", version.coverURL)
        .replace("$diff", difficulties[map.diff].title.toUpperCase())
        .replace("$songArtist", data.metadata.songAuthorName)
        .replace("$songTitle", data.metadata.songName)
        .replace("$description", `Mapped by ${data.metadata.levelAuthorName}`)
        .replace("$pickedby", pickedby(map.id))
        .replaceAll("$id", map.id);
      let win = "";
      if (result.p1.includes(map.id))
        win = winpill1.replace("$winner", match.p1.name);
      if (result.p2.includes(map.id))
        win = winpill2.replace("$winner", match.p2.name);
      mapcard = mapcard.replace("$winpill", win);
      $(`#mapRow${row}`).append(mapcard);
    })
    .fail(() => {
      console.log(`Failed to fetch map info from Beatsaver for ${map.id}`);
    });
}

function clearMapCols() {
  $(`#c0`).html("");
  $(`#c1`).html("");
  $(`#c2`).html("");
  $(`#c4`).html("");
}

function pickedby(id) {
  if (picksAndBans.map1 == id)
    return `<h5>Picked by ${picksAndBans.p2.name}</h5>`;
  if (picksAndBans.map2 == id)
    return `<h5>Picked by ${picksAndBans.p1.name}</h5>`;
  if (picksAndBans.map3 == id)
    return `<h5>Picked by ${picksAndBans.p1.name}</h5>`;
  if (picksAndBans.map4 == id)
    return `<h5>Picked by ${picksAndBans.p2.name}</h5>`;
  if (picksAndBans.map5 == id)
    return `<h5>Picked by ${picksAndBans.p2.name}</h5>`;
  if (picksAndBans.map6 == id)
    return `<h5>Picked by ${picksAndBans.p1.name}</h5>`;
  if (picksAndBans.map7 == id) return `<h5>Tiebreaker</h5>`;
  return "Picked by unknown";
}
function saveResult() {
  localStorage.setItem("bst-currentResult", JSON.stringify(result));
}
