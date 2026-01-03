// ==UserScript==
// @name         neko!!!
// @version      v1.1.0
// @description  a good cat!
// @author       fiveappls/ander-discord
// @match        https://*/*
// ==/UserScript==

const neko = document.createElement("div");

let frame = 0;
let frametime = 0;

let idle = false;
let idletime = 0;
let idleanimation = null;
let idlewalktarget = null;

let dragging = false;
let dragoffsetX = 0;
let dragoffsetY = 0;
let touched = false;

let mousemoved = false;
let mouseX = 0, mouseY = 0;
let nekoX = 32, nekoY = 32;

let stopdistance = Math.random() * 32 + 32;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

const spritesets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
    scratchWallN: [[0, 0], [0, -1]],
    scratchWallS: [[-7, -1], [-6, -2]],
    scratchWallE: [[-2, -2], [-2, -3]],
    scratchWallW: [[-4, 0], [-4, -1]],
    tired: [[-3, -2]],
    sleeping: [[-2, 0], [-2, -1]],
    N: [[-1, -2], [-1, -3]],
    NE: [[0, -2], [0, -3]],
    E: [[-3, 0], [-3, -1]],
    SE: [[-5, -1], [-5, -2]],
    S: [[-6, -3], [-7, -2]],
    SW: [[-5, -3], [-6, -1]],
    W: [[-4, -2], [-4, -3]],
    NW: [[-1, 0], [-1, -1]],
};

const idleanimations = [
    "scratchSelf",
    "scratchWallN",
    "scratchWallS",
    "scratchWallE",
    "scratchWallW",
    "tired",
    "sleeping"
];

function init() {
    const neko_url = "https://github.com/ander-discord/oneko.user.js/blob/main/neko.gif?raw=true";

    neko.id = "neko";
    neko.style.width = "32px";
    neko.style.height = "32px";
    neko.style.left = `${nekoX - 16}px`;
    neko.style.top = `${nekoY - 16}px`;
    neko.style.position = "fixed";
    neko.style.pointerEvents = "auto";
    neko.style.imageRendering = "pixelated";
    neko.style.zIndex = (10 ** 10).toString();
    neko.style.backgroundImage = `url(${neko_url})`;

    document.body.appendChild(neko);

    setSprite("idle", 0);
    setInterval(tick, 250);
}

function setSprite(name, frame) {
    if (!spritesets[name]) name = "idle";
    const sprite = spritesets[name][frame % spritesets[name].length];
    neko.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
}

function tick() {
    frame += 1;
    frametime += 1;

    let diffX = mouseX - nekoX;
    let diffY = mouseY - nekoY;
    let distance = Math.hypot(diffX, diffY) || 1;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    if (distance < stopdistance) {
        if (!idle) {
            stopdistance = Math.random() * 32 + 32;
            setSprite("idle", 0);
        }

        idle = true;
        idletime += 1;

        if (stopdistance < 256) {
            stopdistance += 1;
        }

        if (idletime == 4 && !idleanimation && !idlewalktarget && Math.floor(Math.random() * 3) === 0) {
            idlewalktarget = {
                x: mouseX + Math.random() * stopdistance - stopdistance / 2,
                y: mouseY + Math.random() * stopdistance - stopdistance / 2
            };
            idlewalktarget.x = Math.min(Math.max(16, idlewalktarget.x), window.innerWidth - 16);
            idlewalktarget.y = Math.min(Math.max(16, idlewalktarget.y), window.innerHeight - 16);
            idletime = 0;
        }

        if (idlewalktarget) {
            let dx = idlewalktarget.x - nekoX;
            let dy = idlewalktarget.y - nekoY;
            let dist = Math.hypot(dx, dy) || 1;

            if (dist < 6) {
                idlewalktarget = null;
                idletime = 0;
                frame = 0;
                setSprite("idle", 0);
            } else {
                let direction = "";
                direction += dy / dist > 0.5 ? "S" : "";
                direction += dy / dist < -0.5 ? "N" : "";
                direction += dx / dist > 0.5 ? "E" : "";
                direction += dx / dist < -0.5 ? "W" : "";

                setSprite(direction, frame);

                nekoX += (dx / dist) * 12;
                nekoY += (dy / dist) * 12;

                nekoX = Math.min(Math.max(16, nekoX), window.innerWidth - 16);
                nekoY = Math.min(Math.max(16, nekoY), window.innerHeight - 16);

                neko.style.left = `${nekoX - 16}px`;
                neko.style.top = `${nekoY - 16}px`;
            }

            return;
        }

        if (idletime > 5 && !idleanimation) {
            do {
                idleanimation = idleanimations[Math.floor(Math.random() * idleanimations.length)];
            } while (idleanimation === "scratchWallN" && nekoY > 32 || idleanimation === "scratchWallS" && nekoY < window.innerHeight - 32 || idleanimation === "scratchWallW" && nekoX > 32 || idleanimation === "scratchWallE" && nekoX < window.innerWidth - 32);

            if (touched) {
                idleanimation = "scratchSelf";
            }

            frame = 0;
            idletime = 0;
        }

        if (idleanimation) {
            setSprite(idleanimation, frame);

            if (idleanimation === "sleeping") {
                if (Math.floor(Math.random() * 64) === 0) {
                    idleanimation = null;
                    idletime = 0;
                    setSprite("idle", 0);

                    if (touched) {
                        idleanimation = "scratchSelf";
                        frame = 0;
                        touched = false;
                        return;
                    }
                }
            } else if (frame > spritesets[idleanimation].length * 2) {
                if (touched) {
                    idleanimation = "scratchSelf";
                    frame = 0;
                    touched = false;
                    return;
                }

                idleanimation = null;
                idletime = 0;
                setSprite("idle", 0);
            }
        }

        return;
    }

    idle = false;
    idletime = 0;
    idleanimation = null;
    idlewalktarget = null;

    let direction = "";
    direction += diffY / distance > 0.5 ? "S" : "";
    direction += diffY / distance < -0.5 ? "N" : "";
    direction += diffX / distance > 0.5 ? "E" : "";
    direction += diffX / distance < -0.5 ? "W" : "";

    setSprite(direction, frame);

    nekoX += (diffX / distance) * 16;
    nekoY += (diffY / distance) * 16;

    nekoX = Math.min(Math.max(16, nekoX), window.innerWidth - 16);
    nekoY = Math.min(Math.max(16, nekoY), window.innerHeight - 16);

    neko.style.left = `${nekoX - 16}px`;
    neko.style.top = `${nekoY - 16}px`;
}

init();

neko.addEventListener("pointerdown", (e) => {
    dragging = true;
    dragoffsetX = e.clientX - nekoX;
    dragoffsetY = e.clientY - nekoY;

    idlewalktarget = null;
    idle = true;
    idletime = 0;
    frame = 0;
});

neko.addEventListener("pointerenter", () => {
    if (!dragging) touched = true;
});

document.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    nekoX = e.clientX - dragoffsetX;
    nekoY = e.clientY - dragoffsetY;

    nekoX = Math.min(Math.max(16, nekoX), window.innerWidth - 16);
    nekoY = Math.min(Math.max(16, nekoY), window.innerHeight - 16);

    neko.style.left = `${nekoX - 16}px`;
    neko.style.top = `${nekoY - 16}px`;
});

document.addEventListener("pointerup", () => {
    if (dragging) {
        idleanimation = "scratchSelf";
        idlewalktarget = null;
        idle = true;
        idletime = 0;
        frame = 0;
    }

    dragging = false;
});
