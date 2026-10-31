(function () {
  // marquee
  var words = [
    "Frames",
    "Video Edits",
    "Characters",
    "Moments",
    "Fan Art",
    "Behind the Smile",
    "Stills",
    "Tributes",
  ];
  var s = "";
  for (var k = 0; k < 4; k++) {
    words.forEach(function (w) {
      s += w + "<em>●</em>";
    });
  }
  document.getElementById("mq").innerHTML = s;

  // split headline into letters
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var t = el.textContent;
    el.textContent = "";
    t.split("").forEach(function (c) {
      var sp = document.createElement("span");
      sp.className = "ch";
      sp.textContent = c;
      el.appendChild(sp);
    });
  });

  // IST clock
  function tick() {
    var d = new Date().toLocaleTimeString("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });
    document.getElementById("clock").textContent = d + " IST";
  }
  tick();
  setInterval(tick, 15000);

  // THREE: ring of film frames
  var cv = document.getElementById("gl");
  var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f0b09);
  scene.fog = new THREE.Fog(0x0f0b09, 9, 22);
  var cam = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  var ring = new THREE.Group();
  scene.add(ring);
  var IMAGES = [
    "images/mami1.jpg",
    "images/mami2.jpg",
    "images/mami3.jpg",
    "images/mami4.jpg",
    "images/mami5.jpg",
    "images/mami6.jpg",
    "images/mami7.jpg",
    "images/mami8.jpg",
    "images/mami9.jpg",
    "images/mami10.jpg",
  ];
  var N = 20,
    R = 7.2,
    pal = ["#d23a22", "#e8a33d", "#1f3b34", "#efe6d6", "#2b1b14", "#7a1f2b"];
  function tex(i) {
    var c = document.createElement("canvas");
    c.width = 512;
    c.height = 700;
    var x = c.getContext("2d");
    var bg = pal[i % pal.length],
      light = bg === "#efe6d6" || bg === "#e8a33d",
      fg = light ? "#0f0b09" : "#efe6d6";
    x.fillStyle = bg;
    x.fillRect(0, 0, 512, 700);
    x.fillStyle = "rgba(0,0,0,.45)";
    for (var y = 22; y < 700; y += 46) {
      x.fillRect(12, y, 16, 24);
      x.fillRect(484, y, 16, 24);
    }
    x.strokeStyle = fg;
    x.globalAlpha = 0.5;
    x.lineWidth = 2;
    x.strokeRect(52, 52, 408, 520);
    x.globalAlpha = 1;
    x.fillStyle = fg;
    x.font = 'italic 300px "Instrument Serif", serif';
    x.textAlign = "center";
    x.fillText(String(i + 1).padStart(2, "0"), 256, 400);
    x.font = '500 22px "JetBrains Mono", monospace';
    x.textAlign = "left";
    x.fillText("FRAME " + String(i + 1).padStart(2, "0") + " / " + N, 52, 620);
    x.textAlign = "right";
    x.fillText("MB", 460, 620);
    var t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    var im = new Image();
    im.onload = function () {
      var s = Math.max(512 / im.width, 700 / im.height),
        w = im.width * s,
        h = im.height * s;
      x.globalAlpha = 1;
      x.drawImage(im, (512 - w) / 2, (700 - h) / 2, w, h);
      x.fillStyle = "rgba(15,11,9,.55)";
      for (var y = 22; y < 700; y += 46) {
        x.fillRect(12, y, 16, 24);
        x.fillRect(484, y, 16, 24);
      }
      x.fillStyle = "rgba(15,11,9,.7)";
      x.fillRect(0, 648, 512, 52);
      x.fillStyle = "#efe6d6";
      x.font = '500 22px "JetBrains Mono", monospace';
      x.textAlign = "left";
      x.fillText("FRAME " + String(i + 1).padStart(2, "0") + " / " + N, 52, 682);
      x.textAlign = "right";
      x.fillText("MB", 460, 682);
      t.needsUpdate = true;
    };
    im.src = IMAGES[i % IMAGES.length];
    return t;
  }
  var planes = [];
  function build() {
    for (var i = 0; i < N; i++) {
      var m = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 3.08),
        new THREE.MeshBasicMaterial({
          map: tex(i),
          side: THREE.FrontSide,
        }),
      );
      var a = (i / N) * Math.PI * 2;
      m.position.set(Math.sin(a) * R, Math.sin(i * 1.7) * 0.35, Math.cos(a) * R);
      m.rotation.y = a;
      m.rotation.z = Math.sin(i * 2.3) * 0.05;
      ring.add(m);
      planes.push(m);
    }
  }
  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load('italic 100px "Instrument Serif"'),
      document.fonts.load('500 20px "JetBrains Mono"'),
    ]).then(build, build);
  } else build();

  function size() {
    var w = innerWidth,
      h = innerHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.position.set(0, 1.2, w / h < 0.8 ? 15.5 : 12.2);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }
  addEventListener("resize", size);
  size();

  var mx = 0,
    my = 0,
    tx = 0,
    ty = 0,
    speed = { v: 0.0012 },
    boost = 0;
  addEventListener("pointermove", function (e) {
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
  });
  addEventListener(
    "wheel",
    function (e) {
      boost += e.deltaY * 0.00004;
    },
    { passive: true },
  );
  var ty0 = 0;
  addEventListener(
    "touchstart",
    function (e) {
      ty0 = e.touches[0].clientY;
    },
    { passive: true },
  );
  addEventListener(
    "touchmove",
    function (e) {
      var y = e.touches[0].clientY;
      boost += (ty0 - y) * 0.00012;
      ty0 = y;
    },
    { passive: true },
  );
  var intro = { r: 0.0 };
  (function loop() {
    boost *= 0.94;
    ring.rotation.y += speed.v + boost;
    tx += (mx * 0.35 - tx) * 0.05;
    ty += (my * 0.12 - ty) * 0.05;
    ring.rotation.x = ty * 0.5;
    ring.rotation.z = -tx * 0.08;
    cam.position.x = tx * 1.2;
    cam.lookAt(0, 0, 0);
    for (var j = 0; j < planes.length; j++) {
      var f = (Math.cos((j / N) * Math.PI * 2 + ring.rotation.y) + 1) / 2,
        r = intro.r;
      planes[j].material.color.setScalar((0.3 + 0.7 * f * f) * r);
      planes[j].scale.setScalar((0.7 + 0.3 * r) * (1 + 0.14 * f * f * f));
    }
    renderer.render(scene, cam);
    requestAnimationFrame(loop);
  })();

  // cursor
  var cur = document.getElementById("cur");
  if (matchMedia("(pointer:fine)").matches) {
    var qx = gsap.quickTo(cur, "x", { duration: 0.45, ease: "power3" }),
      qy = gsap.quickTo(cur, "y", { duration: 0.45, ease: "power3" });
    addEventListener("pointermove", function (e) {
      qx(e.clientX);
      qy(e.clientY);
      gsap.to(cur, { opacity: 1, duration: 0.3 });
    });
  }

  // intro timeline
  var num = document.getElementById("num"),
    o = { v: 0 };
  var tl = gsap.timeline();
  gsap.set("[data-up]", { yPercent: 110 });
  gsap.set(".ch", { yPercent: 115, rotate: 6 });
  gsap.set("[data-fade]", { opacity: 0, y: 20 });
  tl.to(o, {
    v: 100,
    duration: 2.1,
    ease: "power2.inOut",
    onUpdate: function () {
      num.textContent = String(Math.round(o.v)).padStart(2, "0");
    },
  })
    .to("#pre", { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "+=.15")
    .to(".ch", { yPercent: 0, rotate: 0, duration: 1.4, ease: "expo.out", stagger: 0.045 }, "-=.5")
    .to("[data-up]", { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.08 }, "-=1.1")
    .to("[data-fade]", { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.15 }, "-=.7")
    .to(intro, { r: 1, duration: 2.4, ease: "power3.out" }, "-=2.4")
    .from(ring.rotation, { y: -1.6, duration: 2.6, ease: "expo.out" }, "<")
    .from(ring.position, { y: -3, duration: 2.2, ease: "expo.out" }, "<");

  // rotating status line
  var lines = [
      "Something special is on its way",
      "The reel is being cut",
      "Edits are in the editing room",
      "Every frame, made with love",
    ],
    li = 0,
    st = document.getElementById("status");
  setInterval(function () {
    li = (li + 1) % lines.length;
    gsap.to(st, {
      opacity: 0,
      y: -6,
      duration: 0.3,
      onComplete: function () {
        st.textContent = lines[li];
        gsap.fromTo(st, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 });
      },
    });
  }, 3200);

  // headline letter hover
  document.querySelectorAll(".ch").forEach(function (c) {
    c.addEventListener("pointerenter", function () {
      gsap.fromTo(
        c,
        { yPercent: 0 },
        {
          yPercent: -12,
          duration: 0.25,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        },
      );
    });
  });
})();