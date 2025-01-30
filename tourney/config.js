/*
  Stored locally

  ---- API Key ----
  API key for Challonge user

  ---- Tournaments ----
  Array of past tournaments
  {
    id: number,
    challongeData: {challonge tournament data},
    config: {
      rounds: {
        roundFormat: "bo3" | "bo5" | "bo7",
        maps: {
          bsId: string,
          category: "balanced" | "tech" | "speed" | "midspeed" | "acc" | "classic",
        }[],
        matches: {
          id: number,
          p1: {
            id: number,
            name: string
          },
          p2: {
            id: number,
            name: string
          }
        }[],
        pools: {
          format: bo3 | bo5 | bo7,
          matchIds: [],
          maps: {
            id: string,

          }[]
        }[]
      }[]
    }
  }[]
*/
$(function () {
  let APIKey = localStorage.getItem("bst-apikey");
  let tournaments = localStorage.getItem("bst-tournaments")
    ? JSON.parse(localStorage.getItem("bst-tournaments"))
    : [];

  // Consts
  const cardMapcardSkeleton = `
  <div class="col-4 mb-4">
    <div class="position-relative" style="z-index: 1000">
      <span class="position-absolute top-0 start-50 translate-middle badge rounded-pill" style="background-color: $categoryColor">
        <strong>$category</strong>
      </span>
    </div>
    <div class="card" style="border-width: 3px;border-color: $categoryColor;background-color: $categoryColor;color: white;">
      <div class="p-2 rounded" style="background-color: $diffColor">
        <img src="$coverImage" class="card-img-top rounded" alt="coverImage" />
        <h6 class="m-1">
          <strong>$diff</strong>
        </h6>
      </div>
      <div class="card-body">
        <h6 class="card-title">$songArtist - $songTitle</h6>
        <p class="card-text">$description</p>
        <button class="btn btn-primary editMap" id="edit$id">Edit</button>
      </div>
    </div>
  </div>`;
  const mapEditSkeleton = `
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">Editing map $id</h5>
          <button
            type="button"
            class="btn-close ocMapEditClose"
          ></button>
        </div>
        <div class="offcanvas-body" id="ocMapEditBody">
          $diffselect
          <select class="form-select mb-3" id="slCat">
            <option value="0">Accuracy</option>
            <option value="1">Balanced</option>
            <option value="2">Tech</option>
            <option value="3">Speed</option>
            <option value="4">Classic</option>
          </select>
        </div>`;
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
  const dummyMaps = [
    { id: "3e740", diff: 2, category: 0 },
    { id: "36f9a", diff: 4, category: 1 },
    { id: "36cf6", diff: 4, category: 2 },
    { id: "30ca6", diff: 2, category: 3 },
    { id: "39e77", diff: 4, category: 4 },
  ];

  // Variables :3
  let config = {
    rounds: [],
    matches: [],
    players: [],
    pools: [],
  };
  let currentPool;
  let currentPoolIndex;
  let matches = [];
  let maxRounds = 0;
  let inputAPIKey = $("#APIKey");
  let currentConfigRound = 0;
  let currentConfigRoundIndex = 0;
  let currentMapId = "";
  let currentMap;

  $.ajaxSetup({
    crossDomain: true,
  });

  $("#btnAPIKey").click(() => {
    APIKey = inputAPIKey.val();
    console.log(APIKey);
    localStorage.setItem("bst-apikey", APIKey);
    setupChallonge();
  });

  $("#slTourney").on("change", () => {
    let tourney = tournaments.find(
      (t) => t.id == $("#slTourney").find(":selected").val()
    );
    if (!tourney) return;
    $.ajax(
      `https://api.challonge.com/v1/tournaments/${tourney.id}.json?api_key=${APIKey}&include_participants=1&include_matches=1`
    )
      .done((data) => {
        for (let player of data.tournament.participants) {
          config.players.push(player.participant);
        }
        for (let match of data.tournament.matches) {
          m = match.match;
          config.matches.push({
            id: m.suggested_play_order,
            winner:
              m.winner_id === m.player1_id
                ? 1
                : m.winner_id === m.player2_id
                ? 2
                : null,
            loser:
              m.loser_id === m.player1_id
                ? 1
                : m.loser_id === m.player2_id
                ? 2
                : null,
            p1: m.player1_id
              ? {
                  id: m.player1_id,
                  name: config.players.find((p) => p.id == m.player1_id)
                    .display_name,
                }
              : null,
            p2: m.player2_id
              ? {
                  id: m.player2_id,
                  name: config.players.find((p) => p.id == m.player2_id)
                    .display_name,
                }
              : null,
          });
          if (m.round > maxRounds) maxRounds = m.round;
        }
        compileTourneyConfig();
      })
      .fail(() => {
        inputAPIKey.addClass("is-invalid");
        inputAPIKey.removeClass("is-valid");
      });
  });

  $("#slConfigRound").on("change", () => {
    currentConfigRoundIndex = Number(
      $("#slConfigRound").find(":selected").val()
    );
    currentConfigRound = config.rounds[currentConfigRoundIndex];
    compileRoundMapInput();
  });

  $("#slConfigPool").on("change", () => {
    currentPoolIndex = Number($("#slConfigPool").find(":selected").val());
    currentPool = config.pools[currentPoolIndex];
    compileMapCards();
    compilePoolMatches();
  });

  $("#uploadPlaylist").on("change", (event) => {
    let reader = new FileReader();
    reader.onload = onReaderLoadPlaylist;
    reader.readAsText(event.target.files[0]);
  });

  $("#uploadConfig").on("change", (event) => {
    let reader = new FileReader();
    reader.onload = onReaderLoadConfig;
    reader.readAsText(event.target.files[0]);
  });

  $("input[type=radio][name=roundFormat]").on("change", () => {
    currentConfigRound.format = this.value;
    console.log(currentConfigRound);
    compileRoundMapInput();
  });

  setupChallonge();

  $(".alert").on("click", (e) => {
    let alert = $(e.target);
    $(".alert").addClass("alert-dark");
    $(".alert").removeClass("alert-light");
    alert.addClass("alert-light");
    alert.removeClass("alert-dark");
  });

  $(document).on("click", ".editMap", (e) => {
    currentMapId = e.target.id.replace("edit", "");
    currentMap = config.pools[currentPoolIndex].maps.find(
      (m) => m.id === currentMapId
    );
    if (!currentMap) return;
    compileDiffSelect();
  });

  $(document).on("click", ".ocMapEditClose", (e) => {
    $("#ocMapEdit").removeClass("show").addClass("hide");
  });

  $(document).on("change", "#slDiff", (e) => {
    let diff = Number(e.target.selectedOptions[0].value);
    currentMap.diff = diff;
    compileMapCards();
    saveConfig();
  });

  $(document).on("change", "#slCat", (e) => {
    console.log(e.target.selectedOptions[0].value);
    let category = Number(e.target.selectedOptions[0].value);
    currentMap.category = category;
    compileMapCards();
    saveConfig();
  });

  $("#addPool").on("click", () => {
    addNewPool();
  });

  $(document).on("click", ".addMatchToPool", (e) => {
    currentPool.matchIds.push(Number(e.target.value));
    compilePoolMatches();
    saveConfig();
  });

  $(document).on("click", ".removeMatchFromPool", (e) => {
    const index = currentPool.matchIds.indexOf(Number(e.target.value));
    if (index > -1) {
      currentPool.matchIds.splice(index, 1);
    }
    compilePoolMatches();
    saveConfig();
  });

  function setupChallonge() {
    console.log(APIKey);
    if (!APIKey || APIKey == "") {
      inputAPIKey.addClass("is-invalid");
      inputAPIKey.removeClass("is-valid");
    } else {
      $.ajax(`https://api.challonge.com/v1/tournaments.json?api_key=${APIKey}`)
        .done((data) => {
          inputAPIKey.removeClass("is-invalid");
          inputAPIKey.addClass("is-valid");
          for (let d of data) {
            let saved = tournaments.find((t) => t.id === d.tournament.id);
            if (saved) {
              saved.challongeData = d.tournament;
            } else {
              tournaments.push({
                id: d.tournament.id,
                challongeData: d.tournament,
                config: config,
              });
            }
          }
          localStorage.setItem("bst-tournaments", JSON.stringify(tournaments));
          compileTourneyOptions();
          console.log(data);
        })
        .fail(() => {
          inputAPIKey.addClass("is-invalid");
          inputAPIKey.removeClass("is-valid");
        });
    }
  }

  function compileTourneyConfig() {
    compileTourneyMatches();
    compileTourneyPlayers();
    compileTourneyPools();
    saveConfig();
    $("#tourneyConfig").removeClass("visually-hidden");
  }

  function compileTourneyOptions() {
    if (tournaments.length <= 0) return;
    $("#divAPIInput").addClass("visually-hidden");
    for (let tourney of tournaments) {
      $("#slTourney").append(
        $("<option>", {
          value: tourney.id,
          text: tourney.challongeData.name,
        })
      );
    }
    $("#divPickTourney").removeClass("visually-hidden");
  }

  function compileTourneyPlayers() {
    if (config.players.length <= 0) return;
    for (let player of config.players) {
      $("#tbPlayers").append(
        `<tr><th scope="row">${player.seed}</th><td>${player.display_name}</td></tr>`
      );
    }
    $("#players").removeClass("visually-hidden");
  }

  function compileTourneyMatches() {
    if (matches.length <= 0) return;
    for (let match of matches) {
      if (match.state != "open") continue;
      let p1 = config.players.find((p) => p.id == match.player1_id);
      let p2 = config.players.find((p) => p.id == match.player2_id);

      $("#tbMatches").append(
        `<tr><th scope="row">${match.round}</th><td>${p1.display_name} vs ${p2.display_name}</td></tr>`
      );
    }
    $("#matches").removeClass("visually-hidden");
  }

  function compileTourneyPools() {
    config.pools = [
      {
        format: "bo3",
        matchIds: [],
        maps: [],
      },
    ];
    let c = JSON.parse(localStorage.getItem("bst-config"));
    if (c && c.pools && c.pools.length >= 1) {
      config.pools = c.pools;
    }
    currentPool = config.pools[0];
    currentPoolIndex = 0;
    for (let i = 0; i < config.pools.length; i++) {
      $("#slConfigPool").append(`
        <option value="${i}">Pool ${i + 1}</option>
      `);
    }
    compileMapCards();
    compilePoolMatches();
  }

  function compileMapCards() {
    $("#mapGrid").html("");
    if (currentPool.maps.length <= 0) return;
    for (let map of currentPool.maps) {
      $.ajax(`https://api.beatsaver.com/maps/id/${map.id}`)
        .done((data) => {
          let version = data.versions.find((v) => v.state === "Published");
          if (!version) {
            console.log(`Couldn't find a published version of map ${map.id}`);
            return;
          }
          $("#mapGrid").append(
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
        })
        .fail(() => {
          console.log(`Failed to fetch map info from Beatsaver for ${map.id}`);
        });
    }
  }

  function compilePoolMatches() {
    $("#matchesInPool").html("");
    $("#matchesNotInAnyPool").html("");
    for (let match of config.matches) {
      if (currentPool.matchIds.includes(match.id)) {
        $("#matchesInPool").append(`
          <div class="row mb-1 border rounded">
            <div class="col-1">
              <p class="mt-1 mb-0">${match.id}</p>
            </div>
            <div class="col">
              <p class="mt-1 mb-0">
                <strong>${match.p1 ? match.p1.name : "?"} VS ${
          match.p2 ? match.p2.name : "?"
        }</strong>
              </p>
            </div>
            <div class="col-2">
              <button class="btn btn-danger removeMatchFromPool" value="${
                match.id
              }">
                X
              </button>
            </div>
          </div>`);
        continue;
      }
      let inPool = false;
      for (let pool of config.pools) {
        if (pool == currentPool) continue;
        if (pool.matchIds.includes(match.id)) {
          inPool = true;
          break;
        }
      }
      if (!inPool) {
        $("#matchesNotInAnyPool").append(`
          <div class="row border rounded">
            <div class="col-1">
              <p class="mt-1 mb-0">${match.id}</p>
            </div>
            <div class="col">
              <p class="mt-1 mb-0">
                <strong>${match.p1 ? match.p1.name : "?"} VS ${
          match.p2 ? match.p2.name : "?"
        }</strong>
              </p>
            </div>
            <div class="col-2">
              <button class="btn btn-success addMatchToPool" value="${
                match.id
              }">Add</button>
            </div>
          </div>`);
      }
    }
  }

  function compilePlaylistUpload(playlist) {
    currentPool.maps = playlist.songs.map((song) => {
      let diff = 0;
      let diffname = song.difficulties[0].name.toLowerCase();
      if (diffname == "normal") diff = 1;
      if (diffname == "hard") diff = 2;
      if (diffname == "expert") diff = 3;
      if (diffname == "expertplus") diff = 4;
      return {
        id: song.key,
        diff: diff,
        category: 0,
      };
    });
    compileMapCards();
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

  function addNewPool() {
    config.pools.push({
      format: "bo3",
      matchIds: [],
      maps: [],
    });
    $("#slConfigPool").append(`
        <option value="${
          config.pools.length - 1
        }">Pool ${config.pools.length}</option>
      `);
  }

  function onReaderLoadPlaylist(event) {
    let obj = JSON.parse(event.target.result);
    compilePlaylistUpload(obj);
  }

  function onReaderLoadConfig(event) {
    config = JSON.parse(event.target.result);
    saveConfig();
  }

  function compileDiffSelect() {
    $.ajax(`https://api.beatsaver.com/maps/id/${currentMapId}`)
      .done((data) => {
        let version = data.versions.find((v) => v.state === "Published");
        if (!version) {
          console.log(`Couldn't find a published version of map ${map.id}`);
          return;
        }
        let options = "";
        for (let diff of version.diffs) {
          if (diff.difficulty == "Easy")
            options += `<option value="0"${
              currentMap.diff === 0 ? " selected" : ""
            }>Easy</option>`;
          if (diff.difficulty == "Normal")
            options += `<option value="1"${
              currentMap.diff === 1 ? " selected" : ""
            }>Normal</option>`;
          if (diff.difficulty == "Hard")
            options += `<option value="2"${
              currentMap.diff === 2 ? " selected" : ""
            }>Hard</option>`;
          if (diff.difficulty == "Expert")
            options += `<option value="3"${
              currentMap.diff === 3 ? " selected" : ""
            }>Expert</option>`;
          if (diff.difficulty == "ExpertPlus")
            options += `<option value="4"${
              currentMap.diff === 4 ? " selected" : ""
            }>ExpertPlus</option>`;
        }
        $("#ocMapEdit").html(
          mapEditSkeleton.replace("$id", currentMapId).replace(
            "$diffselect",
            `
          <select class="form-select mb-3" id="slDiff">
          ${options}
          </select>`
          )
        );
        $("#ocMapEdit").addClass("show");
      })
      .fail(() => {
        console.log(`Failed to fetch map info from Beatsaver for ${map.id}`);
        return "";
      });
  }
});
