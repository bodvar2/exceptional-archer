window.onload = function() {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    canvas.height = window.innerHeight - 10;
    canvas.width = document.body.clientWidth - 5;

    let combatImg = new Image();
    combatImg.src = `public/src/images/effects/combat.png`;

    canvas.addEventListener('contextmenu', (event) => {

        event.preventDefault();
        warrior.destination = {x: event.clientX - canvas.offsetLeft, y: event.clientY - canvas.offsetTop};
    });

    canvas.addEventListener('dblclick', (e) => {
        if(warrior.destination.y === undefined && warrior.destination.x === undefined) {
            movableObjects.push(warrior.shoot(warrior.x, warrior.y, {x: e.clientX, y: e.clientY}));
        }
    });

    let warrior = new Unit({name: 'Archer', level:1, image:'units/archer', speed:2, x:330, y:149, team: 2});
    let enemies = [new Unit({name: 'Skeleton', level:1, image:'units/skeleton', speed:1.4, x:575, y:245})];

    window.main = () => {
        requestAnimationFrame(main);
        tick(canvas, ctx, warrior, enemies, combatImg); // inte vackert att man måste skicka med allt...
    };

    setInterval(() => {
        enemies.forEach(enemy => {
            if(Math.random() > 0.87) {
                enemy.destination = {x: Math.floor(Math.random() * canvas.width), y: Math.floor(Math.random() * canvas.height)}
            } else if(Math.random() > 0.93) {
                enemy.destination = {x: warrior.x, y: warrior.y}
            }
        });
        if(Math.random() > 0.94 && warrior.hp > 0) {
            enemies.push(new Unit({
                name: 'Skeleton',
                level: 1,
                image:'units/skeleton',
                speed: Math.random() + 1.25,
                x: Math.floor(Math.random() * canvas.width),
                y:  Math.floor(Math.random() * canvas.height)
            }))
        } else if(Math.random() > 0.97 && warrior.hp > 0) {
            enemies.push(new Unit({
                name: 'Goblin',
                level: 1,
                image:'units/goblin',
                speed: Math.random() + 1.95,
                hp: 7,
                ws: 7,
                x: Math.floor(Math.random() * canvas.width),
                y:  Math.floor(Math.random() * canvas.height)
            }))
        }
    }, 500);

    main();
};


const movableObjects = [];




const tick = (canvas, ctx, warrior, enemies, combatImg) => {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movableObjects.forEach((arrow, i) => {
        //console.log(arrow);
        arrow.move();
        arrow.speed -= 0.05; // KUL!
        ctx.drawImage(arrow.img, arrow.dir,0,32,32, arrow.x, arrow.y,32,32);
        // Griskod bara för kul test
        enemies.forEach(enemy => {
            if(collisionDetection(arrow, enemy) && enemy.hp > 0) {
                enemy.hp -= Math.ceil(Math.random() * 4  + 1);
                if(enemy.hp <= 0) {
                    warrior.killCount++;
                }
                movableObjects.splice(i, 1);
            } else if(arrow.destination.y === undefined && arrow.destination.x === undefined || arrow.speed <3) {
                movableObjects.splice(i, 1);
            }
        })
    });

    [warrior, ...enemies].sort((a,  b) => a.y > b.y ? 1 : -1).forEach(unit => {
        if(unit.name !== 'Archer' && collisionDetection(unit, warrior) && unit.hp > 0 && warrior.hp > 0) {
            unit.fight(warrior);
            if(unit.hp <= 0) {
                warrior.killCount++;
            }
            ctx.drawImage(combatImg, unit.x, unit.y);
        } else if (unit.hp > 0) {
            unit.move();
        }

        // Draw unit image
        if(unit.hp <= 0) {
            ctx.save();
            ctx.translate(unit.x, unit.y); // Todo ta hänsyn till hitbox eller något...
            ctx.rotate(90 * Math.PI / 180);
            ctx.drawImage(unit.img, unit.hitbox.w / 2, unit.hitbox.h / 2);
            ctx.restore();
        } else {
            // Draw hp bar
            ctx.beginPath();
            ctx.moveTo(unit.x, unit.y);
            ctx.lineTo(unit.x + 25, unit.y);
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.strokeStyle = "#ae0008";
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(unit.x + 1 , unit.y );
            ctx.lineTo(unit.x + unit.hp / unit.max_hp * 25 - 1,unit.y);
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.strokeStyle = "#2f3230";
            ctx.fill();
            ctx.closePath();

            ctx.drawImage(unit.img, unit.x, unit.y);
            // draw unit name and level
            ctx.font = '9px sans-serif';
            ctx.fillStyle = "#dddddd";
            ctx.fillText(`${unit.name}[${unit.level}]`, unit.x, unit.y + unit.hitbox.h + 3);
        }
    });

    ctx.beginPath();
    ctx.arc(warrior.destination.x, warrior.destination.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#cedd22";
    ctx.fill();
    ctx.closePath();


    ctx.font = '20px serif';
    ctx.fillStyle = "#000000";
    ctx.fillText(`Exceptional Archer v0.1`, 20, 28);
    ctx.font = '12px serif';
    ctx.fillText(`Enemies slain: ${warrior.killCount}`, 20, 48);
    ctx.fillText(`Double-click to shoot (must stand still)`, 20, 66);
    ctx.fillText(`Right-click to move`, 20, 80);

    if(warrior.hp <= 0) {
        ctx.fillStyle = "#dadd51";
        ctx.fillText(`You have died. Reload page to start over again...`, 20, 100);
    }

};



const collisionDetection = (object1, object2) => {
    return (
        object1.x + object1.hitbox.x < object2.x + object2.hitbox.x + object2.hitbox.w &&
        object1.x + object1.hitbox.x + object1.hitbox.w > object2.x + object2.hitbox.x &&
        object1.y + object1.hitbox.y < object2.y + object2.hitbox.y + object2.hitbox.h &&
        object1.hitbox.h + object1.hitbox.y + object1.y > object2.y + object2.hitbox.y
    )
};

// The most ancestral map object that everything descends from...
class MapObject {
    constructor({x, y, image, hitbox}) {
        this.x = x || 0;
        this.y = y || 0 ;
        this.img = new Image();
        this.img.src = `public/src/images/${image}.png`; // Make something more extendable..
        this.hitbox = hitbox || {x: 0, w: (this.img.width || 1), y: 0, h: (this.img.height || 1)}; // Fungerar dåligt med sprites :D
    }
}


class MovableObject extends MapObject {
    constructor({speed, destination, x, y, hitbox, image}) {
        super({x, y, hitbox, image});
        this.speed = speed || 1;
        this.destination = destination || {x: undefined, y: undefined}

    }

    move () {
        if(!this.destination.x || !this.destination.y || (this.destination.x === this.x && this.destination.y === this.y)) {
            return;
        }


        const relX = this.destination.x - this.x;
        const relY = this.destination.y - this.y;

        const hypotenuse = Math.sqrt(Math.pow(relX, 2) + Math.pow(relY,  2));
        const xDir = relX / hypotenuse;
        const yDir = relY / hypotenuse;

        if((relX < 0 && xDir * this.speed < relX) || (relX > 0 && xDir * this.speed > relX)) {
            this.x = this.destination.x;
        } else {
            this.x += xDir * this.speed;
        }

        if((relY < 0 && yDir * this.speed < relY) || (relY > 0 && yDir * this.speed > relY)) {
            this.y = this.destination.y;
        } else {
            this.y += yDir * this.speed;
        }


        if(this.x === this.destination.x && this.y === this.destination.y) {
            this.destination = {x: undefined, y: undefined}
        }

    }
}


class Unit extends MovableObject {
    constructor({name, level, x, y, speed, hitbox, image, destination, team, max_hp, ws}) {
        super({x, y, speed, hitbox, destination, image});
        this.name = name;
        this.level = level || 1;
        this.hp = max_hp || 10;
        this.max_hp = max_hp || 10;
        this.ws = ws || 10; // Weapon Skill
        this.team = team || 1;
        this.hitbox = {x: 5, w: 24, y: 0, h: 32}; // top-left x,y bottom-right x,y
        this.destination = {x: undefined, u: undefined};
        this.killCount = 0;
    }


    fight(target) {
        if(Math.random() * this.ws > Math.random() * target.ws) {
            target.hp -= 1;
        } else {
            this.hp -= 1;
        }
    }

    // Performing a shooting attack. Creates a new object with a direction, speed etc.
    shoot = (x, y, destination) => {
        const projectile = new MovableObject({speed: 8, destination, x, y, image: 'effects/arrow_sprite', hitbox : {x: 5, y: 5, w: 5, h: 5}});

        // 0-7 * 32 depending on direction :)
        if(destination.x - x > 0) {
            projectile.dir = 2
        } else {
            projectile.dir = 6;
        }
        projectile.dir *= 32;

        return projectile;
    }
}

