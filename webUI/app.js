function toggleSelection(element) {
  element.classList.toggle("selected");
  const checkbox = element.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;
  if (checkbox.checked) {
    console.log("Selected tweak");
  } else {
    console.log("Unselected tweak");
  }
  var selectedTweaks = [];
  const tweakElements = document.querySelectorAll(".tweak.selected");
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
  if (selectedTweaks.length == 0) {
    const tweakItem = document.createElement("div");
    tweakItem.className = "tweak-list-pack";
    tweakItem.textContent = "Select some packs and see them appear here!";
    document.getElementById("selected-tweaks").appendChild(tweakItem);
  }
}

window.addEventListener("resize", () => {
  if (window.matchMedia("(max-width: 767px)").matches) {
    document.getElementById("selected-tweaks").style.display = "none";
  } else {
    document.getElementById("selected-tweaks").style.display = "block";
  }
});

const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function getTimeoutDuration() {
  return mediaQuery.matches ? 0 : 487.5;
}

function toggleCategory(label) {
  const tweaksContainer = label.nextElementSibling;
  const timeoutDuration = getTimeoutDuration();

  if (tweaksContainer.style.maxHeight) {
    tweaksContainer.style.maxHeight = null;
    setTimeout(() => {
      tweaksContainer.style.display = "none";
      tweaksContainer.style.paddingTop = null;
      tweaksContainer.style.paddingBottom = null;
      label.classList.toggle("open");
    }, timeoutDuration); // Matches the transition duration
  } else {
    tweaksContainer.style.display = "block";
    tweaksContainer.style.paddingTop = "7.5px";
    tweaksContainer.style.paddingBottom = "7.5px";
    label.classList.toggle("open");
    tweaksContainer.style.maxHeight = tweaksContainer.scrollHeight + "px";
    const outerCatLabel =
      label.parentElement.parentElement.previousElementSibling;
    const outerCatContainer = label.parentElement.parentElement;
    if (outerCatLabel.classList.contains("category-label")) {
      outerCatContainer.style.maxHeight =
        outerCatContainer.scrollHeight + tweaksContainer.scrollHeight + "px";
    }
  }
}

function downloadSelectedTweaks() {
  var mcVersion = document.getElementById("mev").value;
  console.log(`Minimum Engine Version is set to ${mcVersion}`);
  var packName = document.getElementById("fileNameInput").value;
  if (!packName) {
    packName = `BTBP-${String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      "0",
    )}`;
  }
  packName = packName.replaceAll("/", "-");
  const selectedTweaks = [];
  const tweakElements = document.querySelectorAll(".tweak.selected");
  tweakElements.forEach((tweak) => {
    selectedTweaks.push({
      category: tweak.dataset.category,
      name: tweak.dataset.name,
      index: parseInt(tweak.dataset.index),
    });
  });

  const tweaksByCategory = {
    "Anti Grief": [],
    Drops: [],
    Fun: [],
    Utility: [],
  };

  const indicesByCategory = {
    "Anti Grief": [],
    Drops: [],
    Fun: [],
    Utility: [],
  };

  selectedTweaks.forEach((tweak) => {
    tweaksByCategory[tweak.category].push(tweak.name);
    indicesByCategory[tweak.category].push(tweak.index);
  });

  const jsonData = {
    "Anti Grief": {
      packs: tweaksByCategory["Anti Grief"],
      index: indicesByCategory["Anti Grief"],
    },
    Drops: {
      packs: tweaksByCategory["Drops"],
      index: indicesByCategory["Drops"],
    },
    Fun: {
      packs: tweaksByCategory["Fun"],
      index: indicesByCategory["Fun"],
    },
    Utility: {
      packs: tweaksByCategory["Utility"],
      index: indicesByCategory["Utility"],
    },

    raw: selectedTweaks.map((tweak) => tweak.name),
  };

  fetchPack("https", jsonData, packName, mcVersion);
}
const serverip = "localhost";

function fetchPack(protocol, jsonData, packName, mcVersion) {
  console.log("Fetching pack...");
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
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.blob();
    })
    .then((blob) => {
      console.log("Received pack!");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${packName}.mcpack`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      if (protocol === "https") {
        console.error("HTTPS error, trying HTTP:", error);
        fetchPack("http", jsonData, packName, mcVersion); // Retry with HTTP
      } else {
        console.error("Error:", error);
      }
    });
}

// Extra code to trigger file input
document.querySelector(".zipinputcontainer").addEventListener("click", function () {
  document.getElementById("zipInput").click();
});

document
  .getElementById("zipInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
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
                      const rawPacks = jsonData.raw;

                      if (Array.isArray(rawPacks)) {
                        rawPacks.forEach(function (pack) {
                          // Find the div with the matching data-name attribute
                          const div = document.querySelector(
                            `div.tweak[data-name="${pack}"]`,
                          );
                          if (div) {
                            // Run the toggleSelection function on the div
                            toggleSelection(div);
                            console.log(
                              `toggleSelection function called for ${pack}`,
                            );
                          } else {
                            console.error(
                              `Div with data-name="${pack}" not found.`,
                            );
                          }
                        });
                      } else {
                        console.error(
                          "The 'raw' field in selected_packs.json is not an array.",
                        );
                      }
                    } catch (error) {
                      console.error("Error parsing JSON:", error);
                    }
                  })
                  .catch(function (error) {
                    console.error(
                      "Error extracting selected_packs.json:",
                      error,
                    );
                  });
              }
            });

            if (!fileFound) {
              console.error(
                "selected_packs.json not found in any folder within the ZIP file.",
              );
            }
          })
          .catch(function (error) {
            console.error("Error reading the ZIP file:", error);
          });
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.error("No file selected.");
    }
  });
