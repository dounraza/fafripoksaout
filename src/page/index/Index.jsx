import React, { useEffect, useRef } from "react";
import "./Index.scss";

const outerCards = [
  [0, "400px", "back"], [30, "400px", "back"], [60, "400px", "face spades"],
  [90, "400px", "back"], [120, "400px", "back"], [150, "400px", "back"],
  [180, "400px", "back"], [210, "400px", "face hearts"], [240, "400px", "back"],
  [270, "400px", "back"], [300, "400px", "back"], [330, "400px", "back"],
];

const innerCards = [22, 67, 112, 157, 202, 247, 292, 337];

const flyingPieces = [
  { type: "card", suit: "spades", fx: "-1180px", fy: "-560px", r0: "510deg", r1: "13deg", t: ".045s" },
  { type: "card", suit: "hearts", fx: "1220px", fy: "-500px", r0: "-620deg", r1: "-4deg", t: ".018s" },
  { type: "chip", fx: "-1280px", fy: "340px", r0: "-620deg", r1: "14deg", t: ".063s" },
  { type: "card", suit: "diamonds", fx: "1240px", fy: "460px", r0: "-430deg", r1: "-10deg", t: ".045s" },
  { type: "chip", fx: "-40px", fy: "-880px", r0: "-430deg", r1: "-11deg", t: ".054s" },
  { type: "card", suit: "clubs", fx: "-980px", fy: "760px", r0: "600deg", r1: "-14deg", t: ".06s" },
  { type: "chip", fx: "1020px", fy: "780px", r0: "510deg", r1: "12deg", t: ".065s" },
  { type: "card", suit: "hearts", fx: "-1340px", fy: "-90px", r0: "-620deg", r1: "-6deg", t: ".062s" },
  { type: "chip", fx: "1360px", fy: "-40px", r0: "-620deg", r1: "-12deg", t: ".006s" },
];

const suits = { spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣" };

function FlyingPiece({ piece }) {
  const style = {
    "--fx": piece.fx,
    "--fy": piece.fy,
    "--r0": piece.r0,
    "--r1": piece.r1,
    "--t": piece.t,
  };

  if (piece.type === "chip") return <div className="big bigchip" style={style} />;
  return (
    <div className="big bigcard" style={style}>
      <i className={piece.suit === "hearts" || piece.suit === "diamonds" ? "r" : ""}>
        {suits[piece.suit]}
      </i>
    </div>
  );
}

function CardRing({ inner = false }) {
  const cards = inner ? innerCards : outerCards;
  return (
    <div className={`ring ${inner ? "ring-in" : "ring-out"}`}>
      {cards.map((item, index) => {
        const angle = inner ? item : item[0];
        const distance = inner ? "265px" : item[1];
        const face = inner ? false : item[2].startsWith("face");
        const suit = inner ? "" : item[2].includes("hearts") ? "♥" : item[2].includes("spades") ? "♠" : "";
        return (
          <div
            className="slot"
            key={`${inner ? "in" : "out"}-${index}`}
            style={{ "--a": `${angle}deg`, "--d": distance }}
          >
            <div className={`card ${face ? "face" : "back"}`}>
              {face && <i className={suit === "♥" ? "r" : ""}>{suit}</i>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const collideRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const cv = canvasRef.current;
    const stage = stageRef.current;
    const collide = collideRef.current;

    if (reduce || !cv || !stage || !collide || !cv.getContext) return;

    const ctx = cv.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let parts = [];
    let running = false;
    let drizzle = false;
    let burstTimer;
    let drizzleTimer;

    const GOLD = ["#FFF8DC", "#F5DA92", "#E7C879", "#D9AE4B", "#C79A2E", "#FFFFFF"];
    const DEBRIS = ["#A5121A", "#8E1219", "#6E0A11", "#F3E7CC", "#FFFDF6", "#D9AE4B", "#E7C879"];
    const rnd = (a, b) => a + Math.random() * (b - a);

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function spawnBurst(cx, cy) {
      for (let i = 0; i < 1500; i++) {
        const ang = rnd(0, Math.PI * 2);
        const sp = Math.pow(Math.random(), 0.55) * rnd(4, 30);
        parts.push({
          x: cx + rnd(-30, 30), y: cy + rnd(-30, 30),
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - rnd(1, 7),
          r: rnd(1, 3.6), g: rnd(0.10, 0.30), d: rnd(0.988, 0.997),
          c: GOLD[(Math.random() * GOLD.length) | 0],
          tw: rnd(0, 6.28), tws: rnd(0.10, 0.28),
          rot: 0, vr: 0, shard: false,
        });
      }

      for (let j = 0; j < 320; j++) {
        const a2 = rnd(0, Math.PI * 2);
        const s2 = Math.pow(Math.random(), 0.6) * rnd(3, 22);
        parts.push({
          x: cx + rnd(-40, 40), y: cy + rnd(-40, 40),
          vx: Math.cos(a2) * s2, vy: Math.sin(a2) * s2 - rnd(2, 9),
          w: rnd(5, 20), h: rnd(4, 14), g: rnd(0.22, 0.42), d: rnd(0.990, 0.997),
          c: DEBRIS[(Math.random() * DEBRIS.length) | 0],
          rot: rnd(0, 6.28), vr: rnd(-0.22, 0.22),
          tw: 0, tws: 0, shard: true,
        });
      }

      if (!running) {
        running = true;
        requestAnimationFrame(tick);
      }
    }

    function spawnDust() {
      for (let i = 0; i < 2; i++) {
        parts.push({
          x: rnd(0, W), y: -12,
          vx: rnd(-0.5, 0.5), vy: rnd(0.5, 1.6),
          r: rnd(0.8, 2.4), g: rnd(0.004, 0.012), d: 0.999,
          c: GOLD[(Math.random() * GOLD.length) | 0],
          tw: rnd(0, 6.28), tws: rnd(0.05, 0.14),
          rot: 0, vr: 0, shard: false,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      if (drizzle && parts.length < 90 && Math.random() < 0.5) spawnDust();

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += p.g;
        p.vx *= p.d;
        p.vy *= p.d;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.tw += p.tws;

        if (p.y > H + 60 || p.x < -120 || p.x > W + 120) {
          parts.splice(i, 1);
          continue;
        }

        const fade = p.y > H * 0.86
          ? Math.max(0, (H + 40 - p.y) / (H * 0.14 + 40))
          : 1;

        if (p.shard) {
          ctx.save();
          ctx.globalAlpha = fade;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        } else {
          ctx.globalAlpha = fade * (0.55 + 0.45 * Math.sin(p.tw));
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      if (parts.length === 0 && !drizzle) {
        running = false;
        return;
      }
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);

    const impactTimer = window.setTimeout(() => {
      const r = stage.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.46;

      stage.classList.add("fire");
      collide.classList.add("gone");
      spawnBurst(cx, cy);

      drizzleTimer = window.setTimeout(() => {
        drizzle = true;
      }, 2600);
    }, 3300);

    return () => {
      window.removeEventListener("resize", resize);
      window.clearTimeout(impactTimer);
      window.clearTimeout(burstTimer);
      window.clearTimeout(drizzleTimer);
    };
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <a className="logo" href="#">
            <b>♠</b>Afripoks
          </a>
          <div className="account">
            <a className="btn btn-ghost" href="/login">Connexion</a>
            <a className="btn btn-gold" href="/register">S'inscrire</a>
          </div>
        </div>
      </header>

      <nav className="subnav">
        <div className="wrap subnav-inner">
          <a className="on" href="#">Accueil</a>
          <a href="/login"><span className="tag">JOUER</span>Cash games</a>
          <a href="/login"><span className="tag">JOUER</span>Tournois</a>
          <a href="#">Apprendre le poker</a>
        </div>
      </nav>

      <section className="stage" id="stage" ref={stageRef}>
        <div className="rings" aria-hidden="true">
          <CardRing />
          <CardRing inner />
        </div>

        <div className="collide" ref={collideRef} aria-hidden="true">
          {flyingPieces.map((piece, index) => <FlyingPiece piece={piece} key={index} />)}
        </div>

        <div className="flash" aria-hidden="true" />
        <div className="wave" aria-hidden="true" />
        <div className="wave w2" aria-hidden="true" />
        <div className="wave w3" aria-hidden="true" />

        <div className="pitch">
          <span className="eyebrow">Tables ouvertes 24h/24</span>
          <h1>
            Tu penses savoir bluffer&nbsp;?<br />
            <em>Prouve-le à la table</em>
          </h1>
          <div className="rule" />
          <div className="cta-row">
            <a className="btn btn-gold btn-lg" href="/register">Créer un compte</a>
            <a className="btn btn-white btn-lg" href="#telecharger">Télécharger l'application</a>
          </div>
          <p className="fineprint">
            Réservé aux personnes de 18 ans et plus. Jouer comporte des risques :
            endettement, isolement, dépendance.
          </p>
        </div>
      </section>

      <canvas id="fx" ref={canvasRef} aria-hidden="true" />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>Deux façons de jouer</h2>
            <p>Des tables ouvertes en permanence, du premier tapis à la table finale.</p>
          </div>

          <div className="grid">
            <article className="offer">
              <span className="suit">♦</span>
              <h3>Cash games</h3>
              <p>
                Vous entrez et sortez quand vous voulez, avec les jetons que vous
                décidez d'amener. Le format le plus libre.
              </p>
              <a className="link" href="#">Voir les parties en cours →</a>
            </article>

            <article className="offer">
              <span className="suit">♠</span>
              <h3>Tournois</h3>
              <p>
                Un buy-in fixe, des centaines de joueurs, une place à la table finale.
                Le rendez-vous du dimanche soir à 20h.
              </p>
              <a className="link" href="#">Consulter le calendrier →</a>
            </article>
          </div>
        </div>
      </section>

      <section className="strip" id="telecharger">
        <div className="wrap">
          <h2>Votre siège vous attend</h2>
          <p>Il commence à croire que vous avez peur. 😂</p>
          <a className="btn btn-gold btn-lg" href="/register">Créer un compte</a>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-links">
            <a href="#">À propos</a>
            <a href="#">Conditions générales</a>
            <a href="#">Confidentialité</a>
            <a href="#">Jeu responsable</a>
            <a href="#">Nous contacter</a>
          </div>
          <p className="legal">
            <span className="age">18+</span>
            Afripoks est réservé aux personnes majeures. Le jeu d'argent peut entraîner
            une dépendance : fixez-vous des limites de dépôt et de temps de jeu.<br/>
           🔒***Votre sécurité avant tout***<br/>
           ✅Site Verifié et fonctionnant  dans un cadre légal  <br/>
           📄Informations et documents officiels disponibles<br/>
           📍Jeu Transaparent.Sans triche<br/>
           🛡️ Vos Transactions et votre compte sont protégé<br/>
            En cas de problème ou de litige,vous pouvez contacter notre service client et,si nécessaire,
            vous adresser aux autorités comptétentes dans le domaine des jeux.
            *** Jouez en toute confiance avec Afripoks.***
          </p>
        </div>
      </footer>
    </>
  );
}
