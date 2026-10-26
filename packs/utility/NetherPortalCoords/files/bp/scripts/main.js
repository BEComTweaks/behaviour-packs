import { system, CommandPermissionLevel } from "@minecraft/server";

// Helper function to format and send coordinates
function sendPortalCoords(player) {
  const dim = player.dimension.id;
  const px = Math.floor(player.location.x);
  const py = Math.floor(player.location.y);
  const pz = Math.floor(player.location.z);

  if (dim === "minecraft:overworld") {
    const nx = Math.floor(px / 8);
    const nz = Math.floor(pz / 8);
    player.sendMessage(
      `§eOverworld: §6${px}, ${py}, ${pz}\n§eNether: §6${nx}, ${py}, ${nz}`,
    );
  } else if (dim === "minecraft:nether") {
    player.sendMessage(
      `§eNether: §6${px}, ${py}, ${pz}\n§eOverworld: §6${px * 8}, ${py}, ${pz * 8}`,
    );
  } else {
    player.sendMessage("§cMust be in Overworld or Nether to use this command.");
  }
}

// 1. Register /scriptevent bt:portalcoords (Vanilla safe, no experiments required)
system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id === "bt:portalcoords") {
    const player = event.sourceEntity;
    if (player && player.typeId === "minecraft:player") {
      sendPortalCoords(player);
    }
  }
});

// 2. Register /bt:portalcoords (Slash command, if Beta APIs / Experiments are enabled)
system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
  if (!customCommandRegistry) return;

  customCommandRegistry.registerCommand(
    {
      name: "bt:portalcoords",
      description: "Calculate optimal portal coordinates",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },
    (context) => {
      const player = context.sourceEntity;
      if (player && player.typeId === "minecraft:player") {
        sendPortalCoords(player);
      }
    },
  );
});
