import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Index.scss';

const Index = () => {
  const [user, setUser] = useState(null);

  // =========================================================
  // AUTH
  // =========================================================
  useEffect(() => {
    async function checkAuth() {
      /*
      // Tu pourras réactiver ceci lorsque ton API sera prête.

      try {
        const { data } = await api.get('/auth/me');

        if (data && data.success && data.user) {
          setUser(data.user);

          localStorage.setItem(
            'afripoks.user',
            JSON.stringify(data.user)
          );

          localStorage.setItem(
            'afripoks.bankroll',
            String(data.user.solde || data.user.chips || 0)
          );
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
      */

      setUser(null);
    }

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Même si l'API échoue, on nettoie la session locale.
    }

    localStorage.removeItem('afripoks.user');
    localStorage.removeItem('afripoks.token');
    localStorage.removeItem('afripoks.bankroll');

    sessionStorage.removeItem('accessToken');

    setUser(null);

    window.location.reload();
  };

  // =========================================================
  // ANIMATION CANVAS
  // =========================================================
  useEffect(() => {
    const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = document.getElementById('fx');

    if (reduce || !canvas || !canvas.getContext) {
      if (canvas) {
        canvas.style.display = 'none';
      }

      return undefined;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return undefined;
    }

    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    let animationFrame = null;
    let impactTimeout = null;
    let drizzleTimeout = null;

    let running = false;
    let drizzle = false;

    const parts = [];

    const GOLD = [
      '#FFF8DC',
      '#F5DA92',
      '#E7C879',
      '#D9AE4B',
      '#C79A2E',
      '#FFFFFF',
    ];

    const DEBRIS = [
      '#A5121A',
      '#8E1219',
      '#6E0A11',
      '#F3E7CC',
      '#FFFDF6',
      '#D9AE4B',
      '#E7C879',
    ];

    const random = (a, b) => {
      return a + Math.random() * (b - a);
    };

    // ---------------------------------------------------------
    // Resize canvas
    // ---------------------------------------------------------
    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);

      W = window.innerWidth;
      H = window.innerHeight;

      canvas.width = W * DPR;
      canvas.height = H * DPR;

      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();

    window.addEventListener('resize', resize);

    // ---------------------------------------------------------
    // Explosion principale
    // ---------------------------------------------------------
    const spawnBurst = (cx, cy) => {
      // Paillettes
      for (let i = 0; i < 1500; i += 1) {
        const angle = random(0, Math.PI * 2);
        const speed =
          Math.pow(Math.random(), 0.55) * random(4, 30);

        parts.push({
          x: cx + random(-30, 30),
          y: cy + random(-30, 30),

          vx: Math.cos(angle) * speed,
          vy:
            Math.sin(angle) * speed -
            random(1, 7),

          r: random(1, 3.6),

          g: random(0.1, 0.3),

          d: random(0.988, 0.997),

          c:
            GOLD[
              Math.floor(
                Math.random() * GOLD.length
              )
            ],

          tw: random(0, Math.PI * 2),

          tws: random(0.1, 0.28),

          rot: 0,
          vr: 0,

          shard: false,

          life: 1,
        });
      }

      // Débris cartes / jetons
      for (let j = 0; j < 320; j += 1) {
        const angle = random(0, Math.PI * 2);

        const speed =
          Math.pow(Math.random(), 0.6) *
          random(3, 22);

        parts.push({
          x: cx + random(-40, 40),
          y: cy + random(-40, 40),

          vx: Math.cos(angle) * speed,

          vy:
            Math.sin(angle) * speed -
            random(2, 9),

          w: random(5, 20),

          h: random(4, 14),

          g: random(0.22, 0.42),

          d: random(0.99, 0.997),

          c:
            DEBRIS[
              Math.floor(
                Math.random() * DEBRIS.length
              )
            ],

          rot: random(0, Math.PI * 2),

          vr: random(-0.22, 0.22),

          tw: 0,

          tws: 0,

          shard: true,

          life: 1,
        });
      }

      if (!running) {
        running = true;
        animationFrame = requestAnimationFrame(tick);
      }
    };

    // ---------------------------------------------------------
    // Poussière dorée continue
    // ---------------------------------------------------------
    const spawnDust = () => {
      for (let i = 0; i < 2; i += 1) {
        parts.push({
          x: random(0, W),

          y: -12,

          vx: random(-0.5, 0.5),

          vy: random(0.5, 1.6),

          r: random(0.8, 2.4),

          g: random(0.004, 0.012),

          d: 0.999,

          c:
            GOLD[
              Math.floor(
                Math.random() * GOLD.length
              )
            ],

          tw: random(0, Math.PI * 2),

          tws: random(0.05, 0.14),

          rot: 0,

          vr: 0,

          shard: false,

          life: 1,
        });
      }
    };

    // ---------------------------------------------------------
    // Boucle animation
    // ---------------------------------------------------------
    function tick() {
      ctx.clearRect(0, 0, W, H);

      if (
        drizzle &&
        parts.length < 90 &&
        Math.random() < 0.5
      ) {
        spawnDust();
      }

      for (
        let i = parts.length - 1;
        i >= 0;
        i -= 1
      ) {
        const p = parts[i];

        p.vy += p.g;

        p.vx *= p.d;
        p.vy *= p.d;

        p.x += p.vx;
        p.y += p.vy;

        p.rot += p.vr;

        p.tw += p.tws;

        if (
          p.y > H + 60 ||
          p.x < -120 ||
          p.x > W + 120
        ) {
          parts.splice(i, 1);
          continue;
        }

        const fade =
          p.y > H * 0.86
            ? Math.max(
                0,
                (H + 40 - p.y) /
                  (H * 0.14 + 40)
              )
            : 1;

        if (p.shard) {
          ctx.save();

          ctx.globalAlpha = fade;

          ctx.translate(p.x, p.y);

          ctx.rotate(p.rot);

          ctx.fillStyle = p.c;

          ctx.fillRect(
            -p.w / 2,
            -p.h / 2,
            p.w,
            p.h
          );

          ctx.restore();
        } else {
          ctx.globalAlpha =
            fade *
            (0.55 +
              0.45 *
                Math.sin(p.tw));

          ctx.fillStyle = p.c;

          ctx.beginPath();

          ctx.arc(
            p.x,
            p.y,
            p.r,
            0,
            Math.PI * 2
          );

          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      if (
        parts.length === 0 &&
        !drizzle
      ) {
        running = false;
        return;
      }

      animationFrame =
        requestAnimationFrame(tick);
    }

    // ---------------------------------------------------------
    // Déclenchement de l'impact
    // ---------------------------------------------------------
    impactTimeout = window.setTimeout(() => {
      const stage =
        document.getElementById('stage');

      const collide =
        document.getElementById('collide');

      if (!stage || !collide) {
        return;
      }

      const rect =
        stage.getBoundingClientRect();

      const cx =
        rect.left + rect.width / 2;

      const cy =
        rect.top + rect.height * 0.46;

      stage.classList.add('fire');

      collide.classList.add('gone');

      spawnBurst(cx, cy);

      drizzleTimeout =
        window.setTimeout(() => {
          drizzle = true;

          if (!running) {
            running = true;
            animationFrame =
              requestAnimationFrame(tick);
          }
        }, 2600);
    }, 3300);

    // ---------------------------------------------------------
    // Cleanup React
    // ---------------------------------------------------------
    return () => {
      window.removeEventListener(
        'resize',
        resize
      );

      if (impactTimeout) {
        window.clearTimeout(
          impactTimeout
        );
      }

      if (drizzleTimeout) {
        window.clearTimeout(
          drizzleTimeout
        );
      }

      if (animationFrame) {
        cancelAnimationFrame(
          animationFrame
        );
      }

      parts.length = 0;

      running = false;
      drizzle = false;

      ctx.clearRect(0, 0, W, H);

      const stage =
        document.getElementById('stage');

      const collide =
        document.getElementById('collide');

      if (stage) {
        stage.classList.remove('fire');
      }

      if (collide) {
        collide.classList.remove('gone');
      }
    };
  }, []);

  // =========================================================
  // JSX
  // =========================================================
  return (
    <div className="page-index">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="topbar">
        <div className="wrap">

          <Link
            className="logo"
            to="/"
          >
            <b>♠</b>
            Afripoks
          </Link>

          <div className="account">

            {user ? (
              <div className="user-connected-bar">

                <span className="solde-badge">
                  💰{' '}
                  {Number(
                    user.solde !== undefined
                      ? user.solde
                      : user.chips || 0
                  ).toLocaleString(
                    'fr-FR'
                  )}{' '}
                  Ar
                </span>

                <span className="user-name-badge">
                  👤{' '}
                  {user.name ||
                    user.pseudo ||
                    'Joueur'}
                </span>

                <Link
                  className="btn btn-gold"
                  to="/table"
                >
                  Jouer
                </Link>

                <Link
                  className="btn btn-ghost"
                  to="/profile"
                >
                  Compte
                </Link>

                <button
                  type="button"
                  className="btn btn-ghost btn-logout"
                  onClick={handleLogout}
                >
                  Déconnexion
                </button>

              </div>
            ) : (
              <>
                <Link
                  className="btn btn-ghost"
                  to="/login"
                >
                  Connexion
                </Link>

                <Link
                  className="btn btn-gold"
                  to="/register"
                >
                  S'inscrire
                </Link>
              </>
            )}

          </div>
        </div>
      </header>


      {/* =====================================================
          SUB NAVIGATION
      ====================================================== */}
      <nav className="subnav">
        <div className="wrap">

          <Link
            className="on"
            to="/"
          >
            Accueil
          </Link>

          <Link to="/">
            <span className="tag">
              JOUER
            </span>
            Cash games
          </Link>

          <Link to="/">
            <span className="tag">
              JOUER
            </span>
            Tournois
          </Link>

          <Link to="/">
            Apprendre le poker
          </Link>

        </div>
      </nav>


      {/* =====================================================
          HERO / STAGE
      ====================================================== */}
      <section
        className="stage"
        id="stage"
      >

        {/* ===================================================
            RINGS
        ==================================================== */}
        <div
          className="rings"
          aria-hidden="true"
        >

          <div className="ring ring-out">

            <div
              className="slot"
              style={{
                '--a': '0deg',
                '--d': '400px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '30deg',
                '--d': '400px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '60deg',
                '--d': '400px',
              }}
            >
              <div className="card face">
                <i>♠</i>
              </div>
            </div>

            <div
              className="slot"
              style={{
                '--a': '90deg',
                '--d': '400px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '120deg',
                '--d': '400px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '150deg',
                '--d': '400px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '180deg',
                '--d': '400px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '210deg',
                '--d': '400px',
              }}
            >
              <div className="card face"
              >
                <i className="r">
                  ♥
                </i>
              </div>
            </div>

            <div
              className="slot"
              style={{
                '--a': '240deg',
                '--d': '400px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '270deg',
                '--d': '400px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '300deg',
                '--d': '400px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '330deg',
                '--d': '400px',
              }}
            >
              <div className="card back" />
            </div>

          </div>


          <div className="ring ring-in">

            <div
              className="slot"
              style={{
                '--a': '22deg',
                '--d': '265px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '67deg',
                '--d': '265px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '112deg',
                '--d': '265px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '157deg',
                '--d': '265px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '202deg',
                '--d': '265px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '247deg',
                '--d': '265px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '292deg',
                '--d': '265px',
              }}
            >
              <div className="card back" />
            </div>

            <div
              className="slot"
              style={{
                '--a': '337deg',
                '--d': '265px',
              }}
            >
              <div className="card back" />
            </div>

          </div>

        </div>


        {/* ===================================================
            GROSSES CARTES / JETONS
        ==================================================== */}
        <div
          className="collide"
          id="collide"
          aria-hidden="true"
        >

          <div
            className="big bigcard"
            style={{
              '--fx': '-1180px',
              '--fy': '-560px',
              '--r0': '510deg',
              '--r1': '13deg',
              '--t': '0.045s',
            }}
          >
            <i>♠</i>
          </div>

          <div
            className="big bigcard"
            style={{
              '--fx': '1220px',
              '--fy': '-500px',
              '--r0': '-620deg',
              '--r1': '-4deg',
              '--t': '0.018s',
            }}
          >
            <i className="r">♥</i>
          </div>

          <div
            className="big bigchip"
            style={{
              '--fx': '-1280px',
              '--fy': '340px',
              '--r0': '-620deg',
              '--r1': '14deg',
              '--t': '0.063s',
            }}
          />

          <div
            className="big bigcard"
            style={{
              '--fx': '1240px',
              '--fy': '460px',
              '--r0': '-430deg',
              '--r1': '-10deg',
              '--t': '0.045s',
            }}
          >
            <i className="r">♦</i>
          </div>

          <div
            className="big bigchip"
            style={{
              '--fx': '-40px',
              '--fy': '-880px',
              '--r0': '-430deg',
              '--r1': '-11deg',
              '--t': '0.054s',
            }}
          />

          <div
            className="big bigcard"
            style={{
              '--fx': '-980px',
              '--fy': '760px',
              '--r0': '600deg',
              '--r1': '-14deg',
              '--t': '0.06s',
            }}
          >
            <i>♣</i>
          </div>

          <div
            className="big bigchip"
            style={{
              '--fx': '1020px',
              '--fy': '780px',
              '--r0': '510deg',
              '--r1': '12deg',
              '--t': '0.065s',
            }}
          />

          <div
            className="big bigcard"
            style={{
              '--fx': '-1340px',
              '--fy': '-90px',
              '--r0': '-620deg',
              '--r1': '-6deg',
              '--t': '0.062s',
            }}
          >
            <i className="r">♥</i>
          </div>

          <div
            className="big bigchip"
            style={{
              '--fx': '1360px',
              '--fy': '-40px',
              '--r0': '-620deg',
              '--r1': '-12deg',
              '--t': '0.006s',
            }}
          />

        </div>


        {/* ===================================================
            FLASH / ONDES
        ==================================================== */}
        <div
          className="flash"
          aria-hidden="true"
        />

        <div
          className="wave"
          aria-hidden="true"
        />

        <div
          className="wave w2"
          aria-hidden="true"
        />

        <div
          className="wave w3"
          aria-hidden="true"
        />


        {/* ===================================================
            TEXTE CENTRAL
        ==================================================== */}
        <div className="pitch">

          <span className="eyebrow">
            Tables ouvertes 24h/24
          </span>

          <h1>
            Tu penses savoir
            bluffer&nbsp;?
            <br />

            <em>
              Prouve-le à la table
            </em>
          </h1>

          <div className="rule" />

          <div className="cta-row">

            {user ? (
              <Link
                className="btn btn-gold btn-lg"
                to="/table"
              >
                Rejoindre une table
              </Link>
            ) : (
              <Link
                className="btn btn-gold btn-lg"
                to="/register"
              >
                Créer un compte
              </Link>
            )}

            <a
              className="btn btn-white btn-lg"
              href="#telecharger"
            >
              Télécharger l'application
            </a>

          </div>

          <p className="fineprint">
            Réservé aux personnes de 18 ans
            et plus. Jouer comporte des
            risques : endettement,
            isolement, dépendance.
          </p>

        </div>

      </section>


      {/* =====================================================
          CANVAS FX
      ====================================================== */}
      <canvas
        id="fx"
        aria-hidden="true"
      />


      {/* =====================================================
          DEUX FAÇONS DE JOUER
      ====================================================== */}
      <section className="section">

        <div className="wrap">

          <div className="section-head">

            <h2>
              Deux façons de jouer
            </h2>

            <p>
              Des tables ouvertes en permanence,
              du premier tapis à la table finale.
            </p>

          </div>


          <div className="grid">

            <article className="offer">

              <span className="suit">
                ♦
              </span>

              <h3>
                Cash Games
              </h3>

              <p>
                Entrez et sortez à votre guise
                avec vos jetons. Vivez la liberté
                totale du poker en temps réel.
              </p>

              <Link
                className="link"
                to="/table"
              >
                Rejoindre une table →
              </Link>

            </article>


            <article className="offer">

              <span className="suit">
                ♠
              </span>

              <h3>
                Tournois
              </h3>

              <p>
                Des centaines de joueurs,
                un buy-in fixe et une place
                en table finale. Le défi ultime
                pour la gloire.
              </p>

              <Link
                className="link"
                to="/table"
              >
                Voir le calendrier →
              </Link>

            </article>

          </div>

        </div>

      </section>


      {/* =====================================================
          STRIP CTA
      ====================================================== */}
      <section className="strip">

        <div className="wrap">

          <h2>
            Votre siège vous attend
          </h2>

          <p>
            Il commence à croire que
            vous avez peur. 😂
          </p>

          <Link
            className="btn btn-gold btn-lg"
            to="/register"
          >
            Créer un compte
          </Link>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer>

        <div className="wrap">

          <div className="foot-links">

            <Link to="/">
              À propos
            </Link>

            <Link to="/">
              Conditions générales
            </Link>

            <Link to="/">
              Confidentialité
            </Link>

            <Link to="/">
              Jeu responsable
            </Link>

            <Link to="/">
              Nous contacter
            </Link>

          </div>

          <p className="legal">

            <span className="age">
              18+
            </span>

            Afripoks est réservé aux personnes
            majeures. Le jeu d'argent peut
            entraîner une dépendance :
            fixez-vous des limites de dépôt
            et de temps de jeu. Numéro de
            licence et autorité de régulation
            à afficher ici avant toute ouverture
            au public.

          </p>

        </div>

      </footer>

    </div>
  );
};

export default Index;
