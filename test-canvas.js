const terrain = [
  {
    image: "terrain/spruce_1",
    hitbox: { x: 35, y: 110, w: 18, h: 20 },
  },
  {
    image: "terrain/leaf_1",
    hitbox: { x: 40, y: 100, w: 15, h: 20 },
  },
  {
    image: "terrain/dead_tree",
    hitbox: { x: 30, y: 60, w: 18, h: 20 },
  },
  {
    image: "terrain/leaf_2",
    hitbox: { x: 35, y: 85, w: 30, h: 25 },
  },
  {
    image: "terrain/rock1",
    hitbox: { x: 25, y: 38, w: 32, h: 26 },
  },
];

window.onload = function () {
  let canvas = document.getElementById("myCanvas");
  let ctx = canvas.getContext("2d");
  canvas.height = window.innerHeight - 10;
  canvas.width = document.body.clientWidth - 5;

  let combatImg = new Image();
  combatImg.src = `public/src/images/effects/combat.png`;

  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (
      warrior.destination.y === warrior.y &&
      warrior.destination.x === warrior.x &&
      warrior.readyToShoot &&
      warrior.hp > 0
    ) {
      movableObjects.push(warrior.shoot({ x: e.clientX, y: e.clientY }));
      warrior.readyToShoot = false;
      setTimeout(() => {
        warrior.readyToShoot = true;
      }, 650);
    }
  });

  window.addEventListener("keydown", (e) => {
    //e.preventDefault();

    switch (e.code) {
      case "KeyW":
        warrior.destination.y = 0;
        break;
      case "KeyA":
        warrior.destination.x = 0;
        break;
      case "KeyS":
        warrior.destination.y =
          window.innerHeight - warrior.hitbox.y - warrior.hitbox.h;
        break;
      case "KeyD":
        warrior.destination.x =
          window.innerWidth - warrior.hitbox.x - warrior.hitbox.w;
        break;
      default:
        return;
    }
  });

  window.addEventListener("keyup", (e) => {
    e.preventDefault();

    switch (e.code) {
      case "KeyW":
      case "KeyS":
        warrior.destination.y = warrior.y;
        break;
      case "KeyA":
      case "KeyD":
        warrior.destination.x = warrior.x;
        break;
      default:
        return;
    }
  });

  let warrior = new Unit({
    name: "Archer",
    level: 1,
    image: "units/archer",
    speed: 2,
    x: 330,
    y: 149,
    team: 2,
  });
  let enemies = [
    new Unit({
      name: "Skeleton",
      level: 1,
      image: "units/skeleton",
      speed: 1.4,
      x: 575,
      y: 245,
    }),
  ];

  let treeCount = Math.floor(Math.random() * 7) + 3;

  for (let i = 0; i < treeCount; i++) {
    const randomTree = terrain[Math.floor(Math.random() * terrain.length)];
    mapObjects.push(
      new MapObject({
        x: Math.floor(Math.random() * window.innerWidth),
        y: Math.floor(Math.random() * window.innerHeight),
        ...randomTree,
      })
    );
  }

  window.main = () => {
    requestAnimationFrame(main);
    tick(canvas, ctx, warrior, enemies, combatImg); // inte vackert att man måste skicka med allt...
  };

  setInterval(() => {
    enemies.forEach((enemy) => {
      if (Math.random() > 0.85) {
        enemy.destination = {
          x: Math.floor(Math.random() * canvas.width),
          y: Math.floor(Math.random() * canvas.height),
        };
      } else if (Math.random() > 0.82) {
        enemy.destination = { x: warrior.x, y: warrior.y };
      }
    });
    if (Math.random() > 0.96 && warrior.hp > 0) {
      enemies.push(
        new Unit({
          name: "Skeleton",
          level: 2,
          image: "units/skeleton",
          speed: Math.random() + 1.32,
          x: Math.floor(Math.random() * canvas.width),
          y: Math.floor(Math.random() * canvas.height),
        })
      );
    } else if (Math.random() > 0.95 && warrior.hp > 0) {
      enemies.push(
        new Unit({
          name: "Goblin",
          level: 1,
          image: "units/goblin",
          speed: Math.random() + 1.99,
          max_hp: 7,
          ws: 7,
          x: Math.floor(Math.random() * canvas.width),
          y: Math.floor(Math.random() * canvas.height),
        })
      );
    } else if (Math.random() > 0.9823 && warrior.hp > 0) {
      enemies.push(
        new Unit({
          name: "Orc",
          level: 3,
          image: "units/orc",
          speed: Math.random() * 1.25 + 1.25,
          max_hp: 14,
          ws: 12,
          x: Math.floor(Math.random() * canvas.width),
          y: Math.floor(Math.random() * canvas.height),
        })
      );
    } else if (Math.random() > 0.998 && warrior.hp > 0) {
      enemies.push(
        new Unit({
          name: "Orc Warlord",
          level: 14,
          image: "units/orc_warlord",
          speed: Math.random() + 2.15,
          max_hp: 38,
          ws: 19,
          x: Math.floor(Math.random() * canvas.width),
          y: Math.floor(Math.random() * canvas.height),
        })
      );
    }
  }, 500);

  main();
};

const movableObjects = [];
const mapObjects = [];

const tick = (canvas, ctx, warrior, enemies, combatImg) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movableObjects.forEach((arrow, i) => {
    arrow.move();
    arrow.speed -= 0.12; // Kul!
    ctx.drawImage(arrow.img, arrow.dir, 0, 32, 32, arrow.x, arrow.y, 32, 32);

    // Griskod bara för kul test
    enemies.forEach((enemy) => {
      if (collisionDetection(arrow, enemy) && enemy.hp > 0) {
        enemy.hp -= Math.ceil(Math.random() * 4 + 1);
        if (enemy.hp <= 0) {
          warrior.killCount++;
        }
        movableObjects.splice(i, 1);
      } else if (
        (arrow.destination.y === arrow.y && arrow.destination.x === arrow.x) ||
        arrow.speed < 5
      ) {
        movableObjects.splice(i, 1);
      }
    });
    mapObjects.forEach((mapObject) => {
      if (collisionDetection(arrow, mapObject)) {
        movableObjects.splice(i, 1);
      }
    });
  });

  mapObjects.forEach((mapObject) => {
    ctx.drawImage(mapObject.img, mapObject.x, mapObject.y);
  });

  // Render all map object images
  [warrior, ...enemies, ...mapObjects]
    .sort((a, b) => (a.y + a.hitbox.y > b.y + b.hitbox.y ? 1 : -1))
    .forEach((unit) => {
      const type = unit.constructor.name;

      if (
        unit.name !== "Archer" &&
        collisionDetection(unit, warrior) &&
        unit.hp > 0 &&
        warrior.hp > 0
      ) {
        unit.fight(warrior);
        if (unit.hp <= 0) {
          warrior.killCount++;
        }
        ctx.drawImage(combatImg, unit.x, unit.y);
      } else if (unit.hp > 0) {
        if (collisionDetection(unit, mapObjects)) {
          unit.move(-1);
          unit.destination = { y: unit.y, x: unit.x };
        } else {
          unit.move();
        }
      }

      // Draw unit image
      if (unit.hp <= 0 && type === "Unit") {
        ctx.save();
        ctx.translate(unit.x, unit.y); // Todo ta hänsyn till hitbox eller något...
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(unit.img, unit.hitbox.w / 2, unit.hitbox.h / 2);
        ctx.restore();
      } else {
        // Draw hp bar
        if (type === "Unit") {
          ctx.beginPath();
          ctx.moveTo(unit.x, unit.y);
          ctx.lineTo(unit.x + 25, unit.y);
          ctx.lineWidth = 5;
          ctx.strokeStyle = "#2f3230";
          ctx.stroke();
          ctx.closePath();

          ctx.beginPath();
          ctx.moveTo(unit.x + 1, unit.y);
          ctx.lineTo(unit.x + (unit.hp / unit.max_hp) * 25 - 1, unit.y);
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#ae0008";
          ctx.stroke();
          ctx.closePath();
        }
        ctx.drawImage(unit.img, unit.x, unit.y);
        // unit.drawHitbox(ctx);
        if (type === "Unit") {
          // draw unit name and level
          ctx.font = "9px sans-serif";
          ctx.fillStyle = "#dddddd";
          ctx.fillText(
            `${unit.name}[${unit.level}]`,
            unit.x,
            unit.y + unit.hitbox.h + 3
          );
          ctx.closePath();
        }
      }
    });

  ctx.beginPath();

  // Draw a gray box
  ctx.fillStyle = "rgba(0,0,20,0.8)";
  ctx.fillRect(0, 0, 260, 120);

  // Draw the game info
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#F3F4F6";
  ctx.fillText(`🏹 Exceptional Archer v0.2`, 20, 28);
  ctx.font = "12px sans-serif";
  ctx.fillText(`Enemies slain: ${warrior.killCount}`, 20, 48);
  ctx.fillText(`Right-click to shoot (must stand still)`, 20, 66);
  ctx.fillText(`Move around with WASD`, 20, 80);

  if (warrior.hp <= 0) {
    ctx.fillText(`You have died. Reload to start over again...`, 20, 100);
  }
};

const collisionDetection = (object1, object2) => {
  let collision = false;

  if (!Array.isArray(object2)) {
    object2 = [object2];
  }
  object2.forEach((object) => {
    if (
      object1.x + object1.hitbox.x <
        object.x + object.hitbox.x + object.hitbox.w &&
      object1.x + object1.hitbox.x + object1.hitbox.w >
        object.x + object.hitbox.x &&
      object1.y + object1.hitbox.y <
        object.y + object.hitbox.y + object.hitbox.h &&
      object1.hitbox.h + object1.hitbox.y + object1.y >
        object.y + object.hitbox.y
    ) {
      collision = true;
    }
  });
  return collision;
};

// The most ancestral map object that everything descends from...
class MapObject {
  constructor({ x, y, image, hitbox }) {
    this.x = x || 0;
    this.y = y || 0;
    this.img = new Image();
    this.img.src = `public/src/images/${image}.png`; // Make something more extendable..
    this.hitbox = hitbox || {
      x: 0,
      w: this.img.width || 1,
      y: 0,
      h: this.img.height || 1,
    }; // Fungerar dåligt med sprites :D
  }

  // Show the hitbox drawing a MapObject
  drawHitbox(ctx) {
    ctx.beginPath();

    ctx.moveTo(this.x + this.hitbox.x, this.y + this.hitbox.y);
    ctx.lineTo(this.x + this.hitbox.x + this.hitbox.w, this.y + this.hitbox.y);
    ctx.lineTo(
      this.x + this.hitbox.x + this.hitbox.w,
      this.y + this.hitbox.y + this.hitbox.h
    );
    ctx.lineTo(this.x + this.hitbox.x, this.y + this.hitbox.y + this.hitbox.h);
    ctx.lineTo(this.x + this.hitbox.x, this.y + this.hitbox.y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#abe748";
    ctx.stroke();

    ctx.closePath();
  }
}

class MovableObject extends MapObject {
  constructor({ speed, destination, x, y, hitbox, image }) {
    super({ x, y, hitbox, image });
    this.speed = speed || 1;
    this.destination = destination || { x, y };
  }

  move(reverse = 1) {
    if (this.destination.x === this.x && this.destination.y === this.y) {
      return;
    }

    // Todo, detta är rätt men det riskerar att göra att man går igenom det man kolliderar med inverterat (50%) risk :D
    // eventuellt kan man reglera det med parametrar istället för bara reverse, men vi får se :)
    const relX = reverse * (this.destination.x - this.x);
    const relY = reverse * (this.destination.y - this.y);

    const hypotenuse = Math.sqrt(Math.pow(relX, 2) + Math.pow(relY, 2));
    const xDir = relX / hypotenuse;
    const yDir = relY / hypotenuse;

    if (
      (relX < 0 && xDir * this.speed < relX) ||
      (relX > 0 && xDir * this.speed > relX)
    ) {
      this.x = this.destination.x;
    } else {
      this.x += xDir * this.speed;
    }

    if (
      (relY < 0 && yDir * this.speed < relY) ||
      (relY > 0 && yDir * this.speed > relY)
    ) {
      this.y = this.destination.y;
    } else {
      this.y += yDir * this.speed;
    }
  }
}

class Unit extends MovableObject {
  constructor({
    name,
    level,
    x,
    y,
    speed,
    hitbox,
    image,
    destination,
    team,
    max_hp,
    ws,
    readyToShoot,
  }) {
    super({ x, y, speed, hitbox, destination, image });
    this.name = name;
    this.level = level || 1;
    this.hp = max_hp || 10;
    this.max_hp = max_hp || 10;
    this.ws = ws || 10; // Weapon Skill
    this.team = team || 1;
    this.hitbox = { x: 5, w: 24, y: 0, h: 32 }; // top-left x,y bottom-right x,y
    this.destination = { x, y };
    this.killCount = 0;
    this.readyToShoot = readyToShoot ?? true;
  }

  fight(target) {
    if (Math.random() * this.ws > Math.random() * target.ws) {
      target.hp -= 1;
    } else {
      this.hp -= 1;
    }
  }

  // Performing a shooting attack. Creates a new object with a direction, speed etc.
  shoot = (destination) => {
    const projectile = new MovableObject({
      speed: 12,
      destination,
      x: this.x,
      y: this.y,
      image: "effects/arrow_sprite",
      hitbox: { x: 13, y: 13, w: 6, h: 6 },
    });

    const dirX = destination.x - this.x;
    const dirY = destination.y - this.y;
    const deg = (Math.atan2(dirY, dirX) / Math.PI) * 180 + 180;

    projectile.dir = (32 * Math.round(deg / 45)) % 256;

    return projectile;
  };
}
