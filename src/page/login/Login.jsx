import { useEffect, useRef, useState } from "react";
import { login as authService } from "../../services/authService";
import "./Login.scss";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [showBoom, setShowBoom] = useState(false);

    const navigate = useNavigate();
    const canvasRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    /*
     * ---------------------------------------------------------
     * ANIMATION DES PAILLETTES / CONFETTIS
     * ---------------------------------------------------------
     */
    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (reduceMotion) {
            canvas.style.display = "none";
            return;
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        const GOLD = [
            "#FFF8DC",
            "#F5DA92",
            "#E7C879",
            "#D9AE4B",
            "#C79A2E",
            "#FFFFFF"
        ];

        const DEBRIS = [
            "#A5121A",
            "#8E1219",
            "#6E0A11",
            "#F3E7CC",
            "#FFFDF6",
            "#D9AE4B",
            "#E7C879"
        ];

        let W = 0;
        let H = 0;
        let DPR = Math.min(window.devicePixelRatio || 1, 2);
        let particles = [];
        let animationFrame;

        const random = (min, max) =>
            min + Math.random() * (max - min);

        const resize = () => {
            W = window.innerWidth;
            H = window.innerHeight;
            DPR = Math.min(window.devicePixelRatio || 1, 2);

            canvas.width = W * DPR;
            canvas.height = H * DPR;

            canvas.style.width = `${W}px`;
            canvas.style.height = `${H}px`;

            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        };

        const spawnDust = () => {
            particles.push({
                x: random(0, W),
                y: -12,
                vx: random(-0.4, 0.4),
                vy: random(0.4, 1.4),
                r: random(0.8, 2.4),
                g: random(0.003, 0.010),
                d: 0.999,
                c: GOLD[(Math.random() * GOLD.length) | 0],
                tw: random(0, Math.PI * 2),
                tws: random(0.04, 0.13),
                rot: 0,
                vr: 0,
                shard: false
            });
        };

        const burst = (cx, cy) => {
            // Paillettes rondes
            for (let i = 0; i < 500; i++) {
                const angle = random(0, Math.PI * 2);
                const speed =
                    Math.pow(Math.random(), 0.55) * random(4, 32);

                particles.push({
                    x: cx + random(-30, 30),
                    y: cy + random(-30, 30),
                    vx: Math.cos(angle) * speed,
                    vy:
                        Math.sin(angle) * speed -
                        random(1, 8),
                    r: random(1, 3.8),
                    g: random(0.10, 0.30),
                    d: random(0.988, 0.997),
                    c: GOLD[(Math.random() * GOLD.length) | 0],
                    tw: random(0, Math.PI * 2),
                    tws: random(0.10, 0.28),
                    rot: 0,
                    vr: 0,
                    shard: false
                });
            }

            // Confettis rectangulaires
            for (let j = 0; j < 120; j++) {
                const angle = random(0, Math.PI * 2);
                const speed =
                    Math.pow(Math.random(), 0.6) * random(3, 24);

                particles.push({
                    x: cx + random(-40, 40),
                    y: cy + random(-40, 40),
                    vx: Math.cos(angle) * speed,
                    vy:
                        Math.sin(angle) * speed -
                        random(2, 10),
                    w: random(5, 20),
                    h: random(4, 14),
                    g: random(0.22, 0.44),
                    d: random(0.990, 0.997),
                    c:
                        DEBRIS[
                            (Math.random() * DEBRIS.length) | 0
                        ],
                    rot: random(0, Math.PI * 2),
                    vr: random(-0.24, 0.24),
                    shard: true
                });
            }
        };

        const tick = () => {
            ctx.clearRect(0, 0, W, H);

            // Petites paillettes permanentes
            if (
                particles.length < 70 &&
                Math.random() < 0.45
            ) {
                spawnDust();
            }

            for (
                let i = particles.length - 1;
                i >= 0;
                i--
            ) {
                const p = particles[i];

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
                    particles.splice(i, 1);
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

            animationFrame =
                requestAnimationFrame(tick);
        };

        resize();

        window.addEventListener("resize", resize);

        animationFrame =
            requestAnimationFrame(tick);

        // Expose burst pour le submit
        canvas.__burst = burst;

        return () => {
            window.removeEventListener(
                "resize",
                resize
            );

            cancelAnimationFrame(animationFrame);
        };
    }, []);

    /*
     * ---------------------------------------------------------
     * CÉLÉBRATION APRÈS CONNEXION
     * ---------------------------------------------------------
     */
    const celebrate = () => {
        setShowVictory(true);

        document.body.style.overflow = "hidden";

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (reduceMotion) {
            setShowBoom(true);
            return;
        }

        setTimeout(() => {
            setShowBoom(true);

            const canvas = canvasRef.current;

            if (canvas?.__burst) {
                canvas.__burst(
                    window.innerWidth / 2,
                    window.innerHeight * 0.46
                );
            }
        }, 1250);
    };

    /*
     * ---------------------------------------------------------
     * CONNEXION
     * ---------------------------------------------------------
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);

        if (!formData.email || !formData.password) {
            setIsLoading(false);
            return;
        }

        try {
            const success = await authService(
                formData.email,
                formData.password
            );

            if (success) {
                const userId =
                    sessionStorage.getItem("userId");

                const username =
                    sessionStorage.getItem("userName");

                // Même comportement que ton ancien Login.jsx
                window.dispatchEvent(
                    new CustomEvent("userLogin", {
                        detail: {
                            userId,
                            username
                        }
                    })
                );

                // On affiche d'abord l'animation
                celebrate();

                // Puis on redirige vers l'accueil
                setTimeout(() => {
                    navigate("/acceuil");
                }, 3500);
            } else {
                setIsLoading(false);
                alert("Email ou mot de passe incorrect.");
            }
        } catch (error) {
            console.error(
                "Erreur de connexion :",
                error
            );

            setIsLoading(false);

            alert(
                "Une erreur est survenue lors de la connexion."
            );
        }
    };

    /*
     * ---------------------------------------------------------
     * CLEANUP BODY
     * ---------------------------------------------------------
     */
    useEffect(() => {
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div className="login-page">

            {/* =========================
                TOP BAR
            ========================== */}
            <header className="topbar">
                <div className="wrap">

                    <Link
                        to="/"
                        className="logo"
                    >
                        <b>♠</b>
                        Afripoks
                    </Link>

                    <div className="account">
                        <Link
                            to="/"
                            className="btn btn-ghost"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>

                </div>
            </header>

            {/* =========================
                SUB NAVIGATION
            ========================== */}
            <nav className="subnav">
                <div className="wrap">

                    <Link
                        to="/"
                        className="on"
                    >
                        Accueil
                    </Link>

                    <Link to="/lobby">
                        <span className="tag">
                            JOUER
                        </span>
                        Cash games
                    </Link>

                    <Link to="/lobby#tournois">
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

            {/* =========================
                STAGE
            ========================== */}
            <section className="stage">

                <div className="panel">

                    <h1>
                        Connexion
                    </h1>

                    <p className="sub">
                        La table n'attend plus que vous.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="login-form"
                    >

                        {/* EMAIL */}
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            placeholder="vous@exemple.com"
                        />

                        {/* PASSWORD */}
                        <label htmlFor="password">
                            Mot de passe
                        </label>

                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            placeholder="Votre mot de passe"
                        />

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="btn btn-gold"
                            id="btnSubmit"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Connexion..."
                                : "Jouer maintenant"}
                        </button>

                    </form>

                    <div
                        id="resultat"
                        className=""
                    />

                    <Link
                        to="/mot-de-passe-oublie"
                        className="retour"
                    >
                        Mot de passe oublié ?
                    </Link>

                    <Link
                        to="/register"
                        className="retour"
                    >
                        Pas encore de compte ? Créer un compte
                    </Link>

                </div>

            </section>

            {/* =========================
                ÉCRAN DE VICTOIRE
            ========================== */}
            <div
                id="victoire"
                className={
                    showVictory
                        ? `on ${
                              showBoom
                                  ? "boom"
                                  : ""
                          }`
                        : ""
                }
                aria-live="polite"
            >

                {/* Jetons */}
                <div
                    className={`jetons ${
                        showBoom ? "gone" : ""
                    }`}
                    id="jetons"
                    aria-hidden="true"
                >

                    <div
                        className="jet"
                        style={{
                            "--fx": "-1150px",
                            "--fy": "-540px",
                            "--r0": "-480deg",
                            "--t": "0s"
                        }}
                    />

                    <div
                        className="jet"
                        style={{
                            "--fx": "1180px",
                            "--fy": "-480px",
                            "--r0": "430deg",
                            "--t": ".04s"
                        }}
                    />

                    <div
                        className="jet"
                        style={{
                            "--fx": "-1240px",
                            "--fy": "360px",
                            "--r0": "520deg",
                            "--t": ".02s"
                        }}
                    />

                    <div
                        className="jet"
                        style={{
                            "--fx": "1210px",
                            "--fy": "440px",
                            "--r0": "-450deg",
                            "--t": ".07s"
                        }}
                    />

                    <div
                        className="jet"
                        style={{
                            "--fx": "-30px",
                            "--fy": "-860px",
                            "--r0": "600deg",
                            "--t": ".05s"
                        }}
                    />

                    <div
                        className="jet"
                        style={{
                            "--fx": "-960px",
                            "--fy": "740px",
                            "--r0": "-560deg",
                            "--t": ".09s"
                        }}
                    />

                    <div
                        className="jet"
                        style={{
                            "--fx": "1000px",
                            "--fy": "760px",
                            "--r0": "470deg",
                            "--t": ".06s"
                        }}
                    />

                </div>

                {/* Flash */}
                <div
                    className="vflash"
                    aria-hidden="true"
                />

                {/* Ondes */}
                <div
                    className="vwave"
                    aria-hidden="true"
                />

                <div
                    className="vwave w2"
                    aria-hidden="true"
                />

                <div
                    className="vwave w3"
                    aria-hidden="true"
                />

                {/* Message */}
                <div className="vmsg">

                    <div
                        className="grosjeton"
                        aria-hidden="true"
                    >
                        <span>
                            GO
                        </span>
                    </div>

                    <h2>
                        Ah te revoilà
                    </h2>

                    <p>
                        On commençait presque à
                        gagner sans toi.
                        <span className="emo">
                            😏
                        </span>
                    </p>

                    <div className="cta">

                        <Link
                            to="/lobby"
                            className="btn btn-gold"
                        >
                            Rejoindre une table
                        </Link>

                    </div>

                </div>

            </div>

            {/* Canvas confettis */}
            <canvas
                ref={canvasRef}
                id="fx"
                aria-hidden="true"
            />

        </div>
    );
};

export default Login;
