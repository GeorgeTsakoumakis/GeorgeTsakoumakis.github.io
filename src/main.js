import { dialogData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialog, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./map.png"); // Load map sprite

k.setBackground(k.Color.fromHex("#311047")); // Set background color

k.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json(); // Load map data
  const layers = mapData.layers; // Get layers

  // Create map
  const map = k.add([
    k.sprite("map"), // Map sprite
    k.pos(0),
    k.scale(scaleFactor),
  ]);

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      // Hitbox
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(), // Physics
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialog: false,
    },
    "player", // Tag, so that we can refer to the player later
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            // Hitbox
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }), // Physics, isStatic: true means it won't move when hit by other objects
          k.pos(boundary.x, boundary.y), // Position
          boundary.name, // Tag
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialog = true;
            displayDialog(
              dialogData[boundary.name],
              () => (player.isInDialog = false)
            );
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 100); // Follow player with camera
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialog) return;

    const worldMousePos = k.toWorld(k.mousePos()); // Get mouse position in world coordinates
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos); // Get angle between player and mouse

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });

  k.onMouseRelease(() => {
    player.stop();
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }

    player.play("idle-side");
  });

  k.onKeyPress("escape", () => {
    const box = document.getElementById("close");
    player.isInDialog = false;
    // close dialog box
    box.click();
  });

  // move with arrows
  k.onKeyDown("up", () => {
    if (player.isInDialog) return;
    player.move(0, -player.speed);
    if (player.curAnim() !== "walk-up") player.play("walk-up");
    player.direction = "up";
  });

  k.onKeyDown("down", () => {
    if (player.isInDialog) return;
    player.move(0, player.speed);
    if (player.curAnim() !== "walk-down") player.play("walk-down");
    player.direction = "down";
  });

  k.onKeyDown("left", () => {
    if (player.isInDialog) return;
    player.move(-player.speed, 0);
    player.flipX = true;
    if (player.curAnim() !== "walk-side") player.play("walk-side");
    player.direction = "left";
  });

  k.onKeyDown("right", () => {
    if (player.isInDialog) return;
    player.move(player.speed, 0);
    player.flipX = false;
    if (player.curAnim() !== "walk-side") player.play("walk-side");
    player.direction = "right";
  });

  // stop moving after key release
  k.onKeyRelease("up", () => {
    player.stop();
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }

    player.play("idle-side");
  });

  k.onKeyRelease("down", () => {
    player.stop();
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }

    player.play("idle-side");
  });

  k.onKeyRelease("left", () => {
    player.stop();
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }

    player.play("idle-side");
  });

  k.onKeyRelease("right", () => {
    player.stop();
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }

    player.play("idle-side");
  });
});

k.go("main");
