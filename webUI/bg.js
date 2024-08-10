const textures = [
  { src: "images/blocks/deepslate.png", probability: 0.618 },
  { src: "images/blocks/deepslate_copper_ore.png", probability: 0.128 },
  { src: "images/blocks/deepslate_coal_ore.png", probability: 0.128 },
  { src: "images/blocks/deepslate_iron_ore.png", probability: 0.064 },
  { src: "images/blocks/deepslate_lapis_ore.png", probability: 0.032 },
  { src: "images/blocks/deepslate_redstone_ore.png", probability: 0.016 },
  { src: "images/blocks/deepslate_gold_ore.png", probability: 0.008 },
  { src: "images/blocks/deepslate_emerald_ore.png", probability: 0.004 },
  { src: "images/blocks/deepslate_diamond_ore.png", probability: 0.002 },
];
function selectTexture() {
  const rand = Math.random();
  let cumulativeProbability = 0;
  for (const texture of textures) {
    cumulativeProbability += texture.probability;
    if (rand < cumulativeProbability) {
      return texture.src;
    }
  }
}
function createTiles() {
  const container = document.getElementById("background-container");
  const numColumns = Math.ceil(window.innerWidth / 100) + 2;
  const numRows = Math.ceil(window.innerHeight / 100) + 2;
  container.innerHTML = "";
  for (let i = 0; i < numColumns; i++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";
    for (let j = 0; j < numRows; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.style.backgroundImage = `url("${selectTexture()}")`;
      rowDiv.appendChild(tile);
    }
    container.appendChild(rowDiv);
  }
}
createTiles();
window.addEventListener("resize", () => {
  document.getElementById("background-container").innerHTML = "";
  createTiles();
});
