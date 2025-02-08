let config = JSON.parse(localStorage.getItem("bst-config"));
let picksAndBans = {
  p1: {
    id: null,
    name: null,
  },
  p2: {
    id: null,
    name: null,
  },
  map1: null,
  map2: null,
  map3: null,
  map4: null,
  map5: null,
  map6: null,
  map7: null,
  bans: [],
};
let match = JSON.parse(localStorage.getItem("bst-currentMatch"));
let pool = JSON.parse(localStorage.getItem("bst-currentPool"));
let state = 0;
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
    <div class="row map" style="margin-bottom: 150px">
            <div class="position-relative" style="z-index: 1000">
                <span class="position-absolute top-0 start-50 translate-middle badge rounded-pill" style="background-color: $categoryColor">
                    <h5><strong>$category</strong></h5>
                </span>
            </div>
        <div class="col">
            <div class="card" style="border-width: 3px;border-color: $categoryColor;background-color: $categoryColor;color: white;">
                <div class="row g-0">
                    <div class="col-4">
                <div class="rounded" style="background-color: $diffColor">
                    <div class="p-2 pb-2 $id">
                        $pickorban
                        <img src="$coverImage" class="card-img-top rounded" alt="coverImage" id="$id"/>
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
                    <p class="card-text">$description</p>
                </div>
                </div>
            </div>
        </div>
    </div>`;

const pickpill = `
    <span class="position-absolute top-50 start-50 translate-middle badge w-100" style="background-color: #61be7d">
        <h4><strong>$info</strong></h4>
    </span>`;

const banpill = `
    <span class="position-absolute top-50 start-50 translate-middle badge w-100" style="background-color: #b23c45">
        <h4><strong>Banned by $name</strong></h4>
    </span>`;

setup();

$(document).on("click", ".map", (e) => {
  let stateDescription = `${picksAndBans.p1.name}<br>is banning`;
  let id = e.target.id;
  console.log(id)
  if (state === 0) {
    picksAndBans.bans = [id];
    stateDescription = `${picksAndBans.p2.name}<br>is banning`;
  }
  if (state === 1) {
    picksAndBans.bans.push(id);
    stateDescription = `${picksAndBans.p2.name}<br>is picking`;
  }
  if (state === 2) {
    picksAndBans.map1 = id;
    stateDescription = `${picksAndBans.p1.name}<br>is picking`;
  }
  if (state === 3) {
    picksAndBans.map2 = id;
    stateDescription = `${picksAndBans.p2.name}<br>is banning`;
  }
  if (state === 4) {
    picksAndBans.bans.push(id);
    stateDescription = `${picksAndBans.p1.name}<br>is banning`;
  }
  if (state === 5) {
    picksAndBans.bans.push(id);
    stateDescription = `${picksAndBans.p1.name}<br>is picking`;
  }
  if (state === 6) {
    picksAndBans.map3 = id;
    stateDescription = `${picksAndBans.p2.name}<br>is picking`;
  }
  if (state === 7) {
    picksAndBans.map4 = id;
    stateDescription = `${picksAndBans.p2.name}<br>is picking`;
  }
  if (state === 8) {
    picksAndBans.map5 = id;
    stateDescription = `${picksAndBans.p1.name}<br>is picking`;
  }
  if (state === 9) {
    picksAndBans.map6 = id;
    stateDescription = `${picksAndBans.p1.name}<br>VS<br>${picksAndBans.p2.name}`;
  }
  if (state >= 10) {
    picksAndBans.map7 = id;
    stateDescription = `${picksAndBans.p1.name}<br>VS<br>${picksAndBans.p2.name}`;
  }
  state++;
  console.log(picksAndBans);
  console.log(state);
  e.target.parentElement.innerHTML = pickOrBan(id) + e.target.outerHTML;
  $(`#c4`).children().last().html(`
      <div class="col p-3">
        <div class="row">
          <div class="col text-center">
            <h1>${stateDescription}</h1>
          </div>
        </div>
      </div>`);
  savePB();
});

$(document).on("click", ".p1Radio", (e) => {
  setP1(Number(e.target.value));
});

async function setup() {
  $("#slP1").append(
    `<div class="form-check"><input class="form-check-input p1Radio" type="radio" name="radioLeft" id="slp${match.p1.id}" value="${match.p1.id}"><label class="form-check-label" for="slp${match.p1.id}">${match.p1.name}</label></div><div class="form-check"><input class="form-check-input p1Radio" type="radio" name="radioLeft" id="slp${match.p2.id}" value="${match.p2.id}"><label class="form-check-label" for="slp${match.p2.id}">${match.p2.name}</label></div>`
  );
  await compileMaps();
  $(`#c4`).append(`
    <div class="row text-white" style="margin-top: 175px">
      <div class="col p-3">
        <div class="row">
          <div class="col text-center">
            <h1>${match.p1.name}<br>is banning</h1>
          </div>
        </div>
      </div>
    </div>`);
}

function setP1(id) {
  if (match.p1.id == id) {
    picksAndBans.p1 = match.p1;
    picksAndBans.p2 = match.p2;
  } else {
    picksAndBans.p2 = match.p1;
    picksAndBans.p1 = match.p2;
  }
  compileMatch();
  savePB();
}

async function compileMaps() {
  clearMapCols();
  for (let map of pool.maps) {
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
          .replace(
            "$description",
            `Mapped by ${data.metadata.levelAuthorName}<br>`
          )
          .replaceAll("$id", map.id);
        mapcard = mapcard.replace("$pickorban", pickOrBan(map.id));
        $(`#c${map.category}`).append(mapcard);
      })
      .fail(() => {
        console.log(`Failed to fetch map info from Beatsaver for ${map.id}`);
      });
  }
}

function compileMatch() {
  console.log($(`#c4`).children().last().html());
  $(`#c4`).children().last().html(`
      <div class="col p-3">
        <div class="row">
          <div class="col text-center">
            <h1>${picksAndBans.p1.name}<br>is banning</h1>
          </div>
        </div>
      </div>`);
}

function clearMapCols() {
  $(`#c0`).html("");
  $(`#c1`).html("");
  $(`#c2`).html("");
  $(`#c4`).html("");
}

function pickOrBan(id) {
  let pickorban = "";
  if (picksAndBans.bans.includes(id)) {
    let index = picksAndBans.bans.indexOf(id);
    if (index === 0 || index === 2) {
      pickorban = banpill.replace("$name", picksAndBans.p1.name);
    } else {
      pickorban = banpill.replace("$name", picksAndBans.p2.name);
    }
  } else {
    if (picksAndBans.map1 == id)
      pickorban = pickpill.replace(
        "$info",
        `Picked by ${picksAndBans.p2.name}`
      );
    if (picksAndBans.map2 == id)
      pickorban = pickpill.replace(
        "$info",
        `Picked by ${picksAndBans.p1.name}`
      );
    if (picksAndBans.map3 == id)
      pickorban = pickpill.replace(
        "$info",
        `Picked by ${picksAndBans.p1.name}`
      );
    if (picksAndBans.map4 == id)
      pickorban = pickpill.replace(
        "$info",
        `Picked by ${picksAndBans.p2.name}`
      );
    if (picksAndBans.map5 == id)
      pickorban = pickpill.replace(
        "$info",
        `Picked by ${picksAndBans.p2.name}`
      );
    if (picksAndBans.map6 == id)
      pickorban = pickpill.replace(
        "$info",
        `Picked by ${picksAndBans.p1.name}`
      );
    if (picksAndBans.map7 == id)
      pickorban = pickpill.replace("$info", `Tiebreaker`);
  }
  return pickorban;
}

function savePB() {
  localStorage.setItem("bst-picksandbans", JSON.stringify(picksAndBans));
}
