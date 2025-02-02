const index = Number(window.location.search.replace("?id=", ""));
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
    <div class="row" style="margin-bottom: 150px">
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
                    <div class="p-2 pb-2">
                        <img src="$coverImage" class="card-img-top rounded" alt="coverImage" />
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

let pool;

function setup() {
  if (index === NaN) return;
  let config = JSON.parse(localStorage.getItem("bst-config"));
  pool = config.pools[index];
  if (!pool) return;
  compileMaps();
}

function compileMaps() {
  for (let map of pool.maps) {
    $.ajax(`https://api.beatsaver.com/maps/id/${map.id}`)
      .done((data) => {
        let version = data.versions.find((v) => v.state === "Published");
        if (!version) {
          console.log(`Couldn't find a published version of map ${map.id}`);
          return;
        }
        $(`#c${map.category}`).append(
          cardMapcardSkeleton
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
            .replace("$id", map.id)
        );
        console.log(map);
      })
      .fail(() => {
        console.log(`Failed to fetch map info from Beatsaver for ${map.id}`);
      });
  }
}

setup();
