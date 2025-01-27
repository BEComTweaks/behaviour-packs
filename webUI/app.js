/************\
| OreUI HTML |
\************/

const OreUI = {
  becomeActive: function (element) {
    element.setAttribute("oreui-state", "active");
  },
  becomeInactive: function (element) {
    element.setAttribute("oreui-state", "inactive");
  },
  toggleActive: function (element) {
    if (element.getAttribute("oreui-state") === "active") {
      element.setAttribute("oreui-state", "inactive");
    } else {
      element.setAttribute("oreui-state", "active");
    }
  },
  becomeDisabled: function (element) {
    element.setAttribute("disabled", true);
  },
  becomeEnabled: function (element) {
    element.removeAttribute("disabled");
  },
  toggleDisabled: function (element) {
    if (element.hasAttribute("disabled")) {
      element.removeAttribute("disabled");
    } else {
      element.setAttribute("disabled", true);
    }
  },
  getCurrentState: function (element) {
    if (element.hasAttribute("disabled")) {
      return "disabled";
    } else if (element.hasAttribute("oreui-state")) {
      return element.getAttribute("oreui-state");
    } else {
      return "inactive";
    }
  },
  isActive: function (element) {
    if (element.hasAttribute("oreui-state")) {
      return element.getAttribute("oreui-state") === "active";
    } else {
      return false;
    }
  },
  isDisabled: function (element) {
    if (element.hasAttribute("disabled")) {
      return element.getAttribute("disabled") === "true";
    } else {
      return false;
    }
  },
  getColor: function (element) {
    return element.getAttribute("oreui-color");
  },
  getActiveColor: function (element) {
    if (element.hasAttribute("oreui-active-color")) {
      return element.getAttribute("oreui-active-color");
    } else {
      return element.getAttribute("oreui-color");
    }
  },
  getDisabledColor: function (element) {
    if (element.hasAttribute("oreui-disabled-color")) {
      return element.getAttribute("oreui-disabled-color");
    } else {
      return "dark";
    }
  },
  setColor: function (element, color) {
    element.setAttribute("oreui-color", color);
  },
  setActiveColor: function (element, color) {
    element.setAttribute("oreui-active-color", color);
  },
  setDisabledColor: function (element, color) {
    element.setAttribute("oreui-disabled-color", color);
  },
};

window.OreUI = OreUI;

/************\
| Search Bar |
\************/

document.addEventListener("click", filterPacks);
function filterPacks() {
  const query = document.getElementById("searchBar").value.toLowerCase().trim();
  const resultsDiv = document.getElementById("searchResults");

  if (query === "") {
    if (resultsDiv.hasAttribute("hasMatches")) {
      resultsDiv.removeAttribute("hasMatches");
    }
    resultsDiv.innerHTML = "";
    return;
  }

  const packs = document.querySelectorAll(".tweak");
  let matches = [];

  packs.forEach((pack, index) => {
    const title = pack.querySelector(".tweak-title").textContent;
    const description = pack.querySelector(".tweak-description").textContent;
    const icon = pack.querySelector("img").src;
    const isSelected = pack.querySelector("input[type='checkbox']").checked; // Check selection state

    if (
      title.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query)
    ) {
      matches.push({
        title,
        description,
        icon,
        isSelected, // Track selection state
        packIndex: index, // Keep track of the original pack's index
      });
    }
  });

  if (matches.length === 0) {
    if (resultsDiv.hasAttribute("hasMatches")) {
      resultsDiv.removeAttribute("hasMatches");
    }
    resultsDiv.innerHTML = "";
  } else {
    if (matches.length > 5) matches = matches.slice(0, 5);
    resultsDiv.setAttribute("hasMatches", true);
    resultsDiv.innerHTML = matches
      .map(
        (match) => `
      <div
        ${match.isSelected ? 'oreui-state="active"' : ""}
        class="search-result-item"
        onclick="triggerPackClick(${match.packIndex})"
        style="cursor: pointer;"
        oreui-type="button"
        oreui-color="dark"
        oreui-active-color="green"
      >
        <img src="${match.icon}" alt="${match.title.trim()}" style="width: 48px; height: 48px;" />
        <div>
          <strong>${match.title}</strong>
          <p>${match.description}</p>
        </div>
      </div>
    `,
      )
      .join("");
  }
}

function triggerPackClick(index) {
  // Simulate a click on the corresponding pack
  const packs = document.querySelectorAll(".tweak");
  if (packs[index]) {
    packs[index].click();
  }
}

/******************\
| Custom functions |
\******************/
const lodash = _.noConflict();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enableSelection(element, checkbox) {
  OreUI.becomeActive(element);
  checkbox.checked = true;
}

function disableSelection(element, checkbox) {
  OreUI.becomeInactive(element);
  checkbox.checked = false;
}

function toggleSelection(element) {
  const checkbox = element.querySelector('input[type="checkbox"]');
  if (checkbox.checked) {
    disableSelection(element, checkbox);
    console.log(
      `[%cselection%c]\nUnselected ${element.dataset.name}`,
      "color: green",
      "color: initial",
    );
  } else {
    enableSelection(element, checkbox);
    console.log(
      `[%cselection%c]\nSelected ${element.dataset.name}`,
      "color: green",
      "color: initial",
    );
  }
  updateSelectedTweaks();
  var selectedTweaks = getSelectedTweaks();
  updateSelectAllButton(selectedTweaks);
  updateURL(selectedTweaks);
  updateDownloadButton(selectedTweaks);
}

function updateDownloadButton(st) {
  const downloadButton = document.querySelector(".download-selected-button");
  if (st["raw"].length == 0) {
    downloadButton.disabled = true;
  } else {
    downloadButton.disabled = false;
  }
}

function updateSelectAllButton(st) {
  document
    .querySelectorAll(".category-label-selectall")
    .forEach((selectallbutton) => {
      const imgElement = selectallbutton.querySelector(
        ".category-label-selectall-img",
      );
      const hoverTextElement = selectallbutton.querySelector(
        ".category-label-selectall-hovertext",
      );
      const category = selectallbutton.dataset.category;
      if (st[category].length == 0) {
        imgElement.src =
          "images/select-all-button/chiseled_bookshelf_empty.png";
        hoverTextElement.textContent = "Select All";
        selectallbutton.onclick = new Function(`selectAll(this);`);
      } else if (
        st[category].length ==
        selectallbutton.parentElement.querySelectorAll(".tweak").length
      ) {
        imgElement.src =
          "images/select-all-button/chiseled_bookshelf_occupied.png";
        hoverTextElement.textContent = "Unselect All";
        selectallbutton.onclick = new Function(`unselectAll(this);`);
      } else {
        imgElement.src =
          "images/select-all-button/chiseled_bookshelf_has_selected.png";
        hoverTextElement.textContent = "Select All";
        selectallbutton.onclick = new Function(`selectAll(this);`);
      }
    });
}

function updateSelectedTweaks() {
  var selectedTweaks = [];
  const tweakElements = document.querySelectorAll(
    ".tweak[oreui-state='active']",
  );
  tweakElements.forEach((tweak) => {
    const labelElement = tweak.querySelector(".tweak-info .tweak-title");
    selectedTweaks.push("**" + tweak.dataset.category);
    selectedTweaks.push(labelElement.textContent);
  });
  selectedTweaks = [...new Set(selectedTweaks)];
  document.getElementById("selected-tweaks").innerHTML = ""; // Clear the container
  selectedTweaks.forEach((tweak) => {
    const tweakItem = document.createElement("div");
    if (tweak.includes("**")) {
      // tweakItem.className = ("tweakListCategory")
      var label = document.createElement("label");
      tweak = tweak.substring(2);
      label.textContent = tweak;
      label.className = "tweak-list-category";
      tweakItem.append(label);
    } else {
      tweakItem.className = "tweak-list-pack";
      tweakItem.textContent = tweak;
    }
    document.getElementById("selected-tweaks").appendChild(tweakItem);
  });
  // if selected tweaks is empty
  if (selectedTweaks.length == 0) {
    const tweakItem = document.createElement("div");
    tweakItem.className = "tweak-list-pack";
    tweakItem.textContent = "Select some packs and see them appear here!";
    document.getElementById("selected-tweaks").appendChild(tweakItem);
  }
}
// query params function
function updateURL(st) {
  for (var key in st) {
    try {
      if (key !== "raw") {
        // remove categories
        delete st[key];
      }
    } catch (e) {
      // keep raw
    }
  }
  const params = new URLSearchParams(window.location.search);
  let newUrl;
  // remove st raw if empty
  if (st["raw"].length == 0) {
    params.delete("st_raw");
    newUrl = `${window.location.pathname}`;
  } else {
    const stcomp = LZString.compressToEncodedURIComponent(JSON.stringify(st));
    params.set("st_raw", stcomp);
    newUrl = `${window.location.pathname}?${params.toString()}`;
  }
  // update url
  window.history.replaceState({}, "", newUrl);
}
// if query params already exists
const loadedparams = new URLSearchParams(window.location.search);
if (loadedparams.has("st_raw")) {
  const st = JSON.parse(
    LZString.decompressFromEncodedURIComponent(loadedparams.get("st_raw")),
  );
  processJsonData(st, "select");
  updateDownloadButton(st);
  const preselectAlerter = document.getElementsByClassName("preselected")[0];
  sleep(500).then(() => {
    // slow down before showing the alert
    preselectAlerter.style.top = "20vh";
  });
  sleep(5000).then(() => {
    preselectAlerter.style.top = "-20vh";
  });
}

function getTimeoutDuration() {
  // for people who want instant stuff
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery.matches ? 0 : 487.5;
}
// toggle category
function toggleCategory(label) {
  const tweaksContainer = label.parentElement.querySelector(
    ".category-controlled",
  );
  const timeoutDuration = getTimeoutDuration();
  const selectallbutton = label.nextElementSibling;
  if (tweaksContainer.style.maxHeight) {
    // close category
    tweaksContainer.style.maxHeight = null;
    selectallbutton.style.opacity = 0;
    setTimeout(() => {
      tweaksContainer.style.display = "none";
      selectallbutton.style.display = "none";
    }, timeoutDuration); // Matches the transition duration
  } else {
    // open category
    tweaksContainer.style.display = "block";
    tweaksContainer.style.maxHeight = tweaksContainer.scrollHeight + "px";
    selectallbutton.style.display = "block";
    selectallbutton.style.opacity = 1;
    // change height to match outer categories
    const outerCatLabel =
      label.parentElement.parentElement.parentElement.querySelector(
        ".category-label",
      );
    const outerCatContainer =
      label.parentElement.parentElement.parentElement.querySelector(
        ".category-controlled",
      );
    if (outerCatLabel) {
      outerCatContainer.style.maxHeight =
        outerCatContainer.scrollHeight + tweaksContainer.scrollHeight + "px";
    }
  }
}

// i wonder what this is for
function downloadSelectedTweaks() {
  // set min_engine_version
  var mcVersion = document.getElementById("mev").value;
  console.log(
    `[%cdownload%c]\nMinimum Engine Version is set to ${mcVersion}`,
    "color: cyan",
    "color: initial",
  );
  // set pack name
  var packName = document.getElementById("fileNameInput").value;
  if (!packName) {
    packName = `BTBP-${String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      "0",
    )}`;
  }
  packName = packName.replaceAll("/", "-");
  console.log(
    `[%cdownload%c]\nPack Name is set to ${packName}`,
    "color: cyan",
    "color: initial",
  );
  // get selected tweaks
  jsonData = getSelectedTweaks();
  // fetch
  fetchPack("https", jsonData, packName, mcVersion);
}
const serverip = "localhost";

function fetchPack(protocol, jsonData, packName, mcVersion) {
  // get download button
  var downloadbutton = document.getElementsByClassName(
    "download-selected-button",
  )[0];
  // For people that spam the download button
  downloadbutton.onclick = null;
  // set proper colors
  if (protocol === "http") {
    // when attempting through http
    OreUI.setActiveColor(downloadbutton, "pink");
    downloadbutton.innerText = "Retrying with HTTP...";
  } else {
    // when attempting through https
    OreUI.setActiveColor(downloadbutton, "green");
    downloadbutton.innerText = "Fetching Pack...";
  }
  // become active
  OreUI.becomeActive(downloadbutton);
  console.log("[%cfetch%c]\nFetching pack...", "color: blue", "color: initial");
  // fetch
  fetch(`${protocol}://${serverip}/exportBehaviourPack`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      packName: packName,
      mcVersion: mcVersion,
    },
    body: JSON.stringify(jsonData),
  })
    .then((response) => {
      // when the response doesnt feel good
      if (!response.ok) {
        console.log(
          "[%cerror%c]\nNetwork response was not ok",
          "color: red",
          "color: initial",
        );
      }
      return response.blob();
    })
    .then(async (blob) => {
      // pack received
      console.log(
        "[%cfetch%c]\nReceived pack!",
        "color: blue",
        "color: initial",
      );
      downloadbutton.innerText = "Obtained pack!";
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${packName}.mcaddon`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      // reset button text
      await sleep(1000);
      OreUI.becomeInactive(downloadbutton);
      OreUI.setActiveColor(downloadbutton, "dark");
      downloadbutton.innerText = "Download Selected Tweaks";
      downloadbutton.onclick = downloadSelectedTweaks;
    })
    .catch(async (error) => {
      // when the response doesnt send
      if (protocol === "https") {
        console.log(
          `[%cerror%c]\nHTTPS error, trying HTTP: %c${error}`,
          "color: red",
          "color: initial",
          "color: red",
        );
        fetchPack("http", jsonData, packName, mcVersion); // Retry with HTTP
      } else {
        console.log(
          `[%cerror%c] Error: %c${error}`,
          "color: red",
          "color: initial",
          "color: red",
        );
        downloadbutton.innerText =
          "Couldn't fetch pack. Check console for error log.";
        OreUI.setActiveColor(downloadbutton, "red");
        await sleep(3000);
        OreUI.setActiveColor(downloadbutton, "dark");
        downloadbutton.innerText = "Download Selected Tweaks";
        downloadbutton.onclick = downloadSelectedTweaks;
        OreUI.becomeInactive(downloadbutton);
      }
    });
}

// process json data from url/json
function processJsonData(jsonData, dowhat) {
  const rawPacks = jsonData.raw;

  if (Array.isArray(rawPacks)) {
    rawPacks.forEach(function (pack) {
      const div = document.querySelector(`div.tweak[data-name="${pack}"]`);
      if (div) {
        if (dowhat == "select") {
          if (!div.querySelector('input[type="checkbox"]').checked) {
            enableSelection(div, div.querySelector('input[type="checkbox"]'));
            console.log(
              `[%cmass%c]\nSelected ${pack}`,
              "color: green",
              "color: initial",
            );
          }
        } else if (dowhat == "unselect") {
          if (div.querySelector('input[type="checkbox"]').checked) {
            disableSelection(div, div.querySelector('input[type="checkbox"]'));
            console.log(
              `[%cmass%c]\nUnselected ${pack}`,
              "color: green",
              "color: initial",
            );
          }
        }
      } else {
        console.log(
          `[%cerror%c]\nDiv with data-name="${pack}" not found.`,
          "color: red",
          "color: initial",
        );
      }
    });
  } else {
    console.log(
      "[%cerror%c]\n%cThe 'raw' field in selected_packs.json is not an array.",
      "color: red",
      "color: initial",
    );
  }
  updateSelectedTweaks();
  const st = getSelectedTweaks();
  updateSelectAllButton(st);
  updateURL(st);
  updateDownloadButton(st);
}
// get selected tweaks
function getSelectedTweaks() {
  const selectedTweaks = [];
  const tweakElements = document.querySelectorAll(
    ".tweak[oreui-state='active']",
  );
  tweakElements.forEach((tweak) => {
    selectedTweaks.push({
      category: tweak.dataset.category,
      name: tweak.dataset.name,
      index: parseInt(tweak.dataset.index),
    });
  });
  const jsonData = {
    "Anti Grief": [],
    Drops: [],
    Fun: [],
    Utility: [],
  };
  selectedTweaks.forEach((tweak) => {
    jsonData[tweak.category].push(tweak.name);
  });
  jsonData.raw = selectedTweaks.map((tweak) => tweak.name);
  console.log(
    "[%cget%c]\nObtained selected tweaks!",
    "color: purple",
    "color: initial",
  );
  return jsonData;
}
// Extra code to trigger file input
document
  .querySelector(".zipinputcontainer")
  .addEventListener("click", function () {
    document.getElementById("zipInput").click();
  });
// upload pack
const zipInput = document.getElementById("zipInput");
const selectedFile = document.querySelector(".selectedFile");
zipInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (zipInput.files.length > 0) {
    selectedFile.innerText = zipInput.files[0].name;
  }
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      JSZip.loadAsync(e.target.result)
        .then(function (zip) {
          let fileFound = false;

          zip.forEach(function (relativePath, zipEntry) {
            if (relativePath.endsWith("selected_packs.json")) {
              fileFound = true;
              zipEntry
                .async("string")
                .then(function (content) {
                  try {
                    const jsonData = JSON.parse(content);
                    processJsonData(jsonData, "select");
                    document.querySelector(
                      ".download-selected-button",
                    ).disabled = false;
                  } catch (error) {
                    console.log(
                      `[%cerror%c]\nError parsing JSON: %c${error}`,
                      "color: red",
                      "color: initial",
                      "color: red",
                    );
                    selectedFile.innerText = "Invalid JSON in pack";
                    sleep(3000).then(() => {
                      selectedFile.innerText = "Upload pack";
                    });
                  }
                })
                .catch(function (error) {
                  console.log(
                    `[%cerror%c]\nError extracting selected_packs.json: %c${error}`,
                    "color: red",
                    "color: initial",
                    "color: red",
                  );
                  selectedFile.innerText = "Invalid pack";
                  sleep(3000).then(() => {
                    selectedFile.innerText = "Upload pack";
                  });
                });
            }
          });

          if (!fileFound) {
            console.log(
              `[%cerror%c]\nselected_packs.json not found in any folder within the ZIP file.`,
              "color: red",
              "color: initial",
            );
            selectedFile.innerText = "Invalid pack";
            sleep(3000).then(() => {
              selectedFile.innerText = "Upload pack";
            });
          }
        })
        .catch(function (error) {
          console.log(
            `[%cerror%c]\nError reading ZIP file: %c${error}`,
            "color: red",
            "color: initial",
            "color: red",
          );
          selectedFile.innerText = "Invalid file";
          sleep(3000).then(() => {
            selectedFile.innerText = "Upload pack";
          });
        });
    };
    reader.readAsArrayBuffer(file);
  } else {
    console.log(
      `[%cerror%c]\nNo file selected.`,
      "color: red",
      "color: initial",
    );
  }
});

function selectAll(element) {
  const st = JSON.parse(
    LZString.decompressFromEncodedURIComponent(element.dataset.allpacks),
  );
  processJsonData(st, "select");
  updateSelectAllButton(getSelectedTweaks());
}

function unselectAll(element) {
  const st = JSON.parse(
    LZString.decompressFromEncodedURIComponent(element.dataset.allpacks),
  );
  processJsonData(st, "unselect");
  updateSelectAllButton(getSelectedTweaks());
}

function updateCategoryHeight() {
  const categoryControlled = document.querySelectorAll(".category-controlled");
  categoryControlled.forEach((element) => {
    if (element.style.maxHeight) {
      element.style.maxHeight = element.scrollHeight + "px";
    }
  });
}

window.addEventListener("resize", updateCategoryHeight);
