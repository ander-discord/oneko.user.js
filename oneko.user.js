// ==UserScript==
// @name         neko!!!
// @version      v1
// @description  a good cat!
// @author       fiveappls
// @match        https://*/*
// ==/UserScript==

(function(){
    'use strict';
    console.log("neko");
    const neko = document.createElement("div");
    
    let frame = 0;
    let frametime = 0;
    let idleTime = 0;
    let idleanimation = null;
    let idle = false;
    let idlewalktarget = null;
    let cooldown = 0;
    
    let mouseX = 0, mouseY = 0;
    let nekoX = 32, nekoY = 32;
    
    let sleep = 0;
    let lastsleep = 0;
    let scratchself = 0;
    let stopdistance = Math.random() * 48 + 16;
    
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX, mouseY = e.clientY;
    });
    
    const spritesets = {
        idle: [[-3, -3]],
        alert: [[-7, -3]],
        scratchSelf: [
          [-5, 0],
          [-6, 0],
          [-7, 0],
        ],
        scratchWallN: [
          [0, 0],
          [0, -1],
        ],
        scratchWallS: [
          [-7, -1],
          [-6, -2],
        ],
        scratchWallE: [
          [-2, -2],
          [-2, -3],
        ],
        scratchWallW: [
          [-4, 0],
          [-4, -1],
        ],
        tired: [[-3, -2]],
        sleeping: [
          [-2, 0],
          [-2, -1],
        ],
        N: [
          [-1, -2],
          [-1, -3],
        ],
        NE: [
          [0, -2],
          [0, -3],
        ],
        E: [
          [-3, 0],
          [-3, -1],
        ],
        SE: [
          [-5, -1],
          [-5, -2],
        ],
        S: [
          [-6, -3],
          [-7, -2],
        ],
        SW: [
          [-5, -3],
          [-6, -1],
        ],
        W: [
          [-4, -2],
          [-4, -3],
        ],
        NW: [
          [-1, 0],
          [-1, -1],
        ],
    };
    
    function init() {
        const neko_url = "http://localhost:3000/neko.gif";
    
        neko.id = "neko";
        neko.style.width = "32px";
        neko.style.height = "32px";
        neko.style.left = `${nekoX - 16}px`;
        neko.style.top = `${nekoY - 16}px`;
        neko.style.position = "fixed";
        neko.style.pointerEvents = "none";
        neko.style.imageRendering = "pixelated";
    
        neko.style.zIndex = (10 ** 10).toString();
        neko.style.backgroundImage = `url(${neko_url})`;
        document.body.appendChild(neko);
    
        setSprite("idle", 0);
        setInterval(tick, 200);
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
    
        if (distance < 64) {
            setSprite("idle", 0);
    
            if (!idle) {
                stopdistance = Math.random() * 48 + 16;
            }
    
            idle = true;
            idleTime += 1;
    
            if (sleep <= 0 && cooldown <= 0) {
                if (!idlewalktarget) {
                    idlewalktarget = {
                        x: mouseX + (Math.random() * stopdistance - stopdistance/2),
                        y: mouseY + (Math.random() * stopdistance - stopdistance/2)
                    };
                    frame = 0;
                }
    
                let dx = idlewalktarget.x - nekoX;
                let dy = idlewalktarget.y - nekoY;
                let d = Math.hypot(dx, dy) || 1;
    
                if (d < 4) {
                    idlewalktarget = null;
                    cooldown = 64;
                    setSprite("idle", 0);
                    return;
                }
    
                let dir = "";
                dir += dy / d > 0.5 ? "S" : "";
                dir += dy / d < -0.5 ? "N" : "";
                dir += dx / d > 0.5 ? "E" : "";
                dir += dx / d < -0.5 ? "W" : "";
    
                setSprite(dir, frame);
    
                nekoX += (dx / d) * 6;
                nekoY += (dy / d) * 6;
                nekoX = Math.min(Math.max(16, nekoX), window.innerWidth - 16);
                nekoY = Math.min(Math.max(16, nekoY), window.innerHeight - 16);  
    
                neko.style.left = `${nekoX - 16}px`;
                neko.style.top = `${nekoY - 16}px`;
    
                sleep += 0.1;
    
                return;
            }
    
            if (idleTime > 16 && !idleanimation) {
                let avaibleanimations = ["scratchSelf"];
    
                if (frametime - lastsleep < 256) {
                    if (nekoX < 32) {
                        avaibleanimations.push("scratchWallW");
                    }
                    if (nekoY < 32) {
                        avaibleanimations.push("scratchWallN");
                    }
                    if (nekoX > window.innerWidth - 32) {
                        avaibleanimations.push("scratchWallE");
                    }
                    if (nekoY > window.innerHeight - 32) {
                        avaibleanimations.push("scratchWallS");
                    }
                }
    
                if (sleep >= 2) {
                    avaibleanimations.push("tired");
                }
                if (sleep >= 4) {
                    avaibleanimations.push("sleeping");
                }
    
                idleanimation = avaibleanimations[Math.floor(Math.random() * avaibleanimations.length)];
    
                if (idleanimation.startsWith("scratch")) {
                    sleep += 1.5;
                } else if (idleanimation === "tired") {
                    sleep -= Math.random() - 0.5;
                } else if (idleanimation === "sleeping") {
                    sleep -= 2;
                    lastsleep = frametime;
                }
    
                frame = 0;
                idleTime = 0;
            }
    
            if (idleanimation) {
                setSprite(idleanimation, frame);
                if (idleanimation === "sleeping") {
                    if (Math.random() * 64 == 0) idleanimation = null;
                } else {
                    if (frame > spritesets[idleanimation].length * 2) idleanimation = null;
                }
            } else {
                setSprite("idle", 0);
            }
    
            cooldown -= 1;
    
            return 0;
        };
    
        idle = false;
    
        let direction;
        direction = diffY / distance > 0.5 ? "S" : "";
        direction += diffY / distance < -0.5 ? "N" : "";
        direction += diffX / distance > 0.5 ? "E" : "";
        direction += diffX / distance < -0.5 ? "W" : "";
        setSprite(direction, frame);
    
        nekoX += (diffX / distance) * 16;
        nekoY += (diffY / distance) * 16;
    
        nekoX = Math.min(Math.max(16, nekoX), window.innerWidth - 16);
        nekoY = Math.min(Math.max(16, nekoY), window.innerHeight - 16);
    
        sleep += 0.1;
    
        neko.style.left = `${nekoX - 16}px`;
        neko.style.top = `${nekoY - 16}px`;
    }
    
    init();
})();
