import { useEffect, useRef, useState } from "react";
import { register as registerService } from "../../services/registerService";
import { User, Key, Eye, EyeOff } from "lucide-react";
import "./register.scss";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import pokerBackground from "../../image/bg.jpg";
import logo from "../../styles/image/logo.jpeg";

const Register = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: ""
    });

    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isOver18, setIsOver18] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [boom, setBoom] = useState(false);

    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const navigate = useNavigate();

    // --------------------------------------------------
    // Gestion des champs
    // --------------------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // --------------------------------------------------
    // Confettis / paillettes
    // --------------------------------------------------

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const reduceMotion = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (reduceMotion) {
            canvas.style.display = "none";
            return;
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        const DPR = Math.min(window.devicePixelRatio || 1, 2);

        let width = 0;
        let height = 0;

        let particles = [];
        let running = true;

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

        const random = (min, max) =>
            min + Math.random() * (max - min);

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * DPR;
            canvas.height = height * DPR;

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        };

        const spawnDust = () => {
            particles.push({
                x: random(0, width),
                y: -12,
                vx: random(-0.4, 0.4),
                vy: random(0.4, 1.4),
                r: random(0.8, 2.4),
                gravity: random(0.003, 0.01),
                drag: 0.999,
                color: GOLD[
                    Math.floor(Math.random() * GOLD.length)
                ],
                tw: random(0, Math.PI * 2),
                twSpeed: random(0.04, 0.13),
                rotation: 0,
                rotationSpeed: 0,
                shard: false
            });
        };

        const burst = (centerX, centerY) => {
            // Petites particules rondes
            for (let i = 0; i < 900; i++) {
                const angle = random(0, Math.PI * 2);

                const speed =
                    Math.pow(Math.random(), 0.55) *
                    random(4, 32);

                particles.push({
                    x: centerX + random(-30, 30),
                    y: centerY + random(-30, 30),
                    vx: Math.cos(angle) * speed,
                    vy:
                        Math.sin(angle) * speed -
                        random(1, 8),
                    r: random(1, 3.8),
                    gravity: random(0.1, 0.3),
                    drag: random(0.988, 0.997),
                    color:
                        GOLD[
                            Math.floor(
                                Math.random() * GOLD.length
                            )
                        ],
                    tw: random(0, Math.PI * 2),
                    twSpeed: random(0.1, 0.28),
                    rotation: 0,
                    rotationSpeed: 0,
                    shard: false
                });
            }

            // Morceaux de confettis
            for (let i = 0; i < 340; i++) {
                const angle = random(0, Math.PI * 2);

                const speed =
                    Math.pow(Math.random(), 0.6) *
                    random(3, 24);

                particles.push({
                    x: centerX + random(-40, 40),
                    y: centerY + random(-40, 40),
                    vx: Math.cos(angle) * speed,
                    vy:
                        Math.sin(angle) * speed -
                        random(2, 10),
                    width: random(5, 20),
                    height: random(4, 14),
                    gravity: random(0.22, 0.44),
                    drag: random(0.99, 0.997),
                    color:
                        DEBRIS[
                            Math.floor(
                                Math.random() * DEBRIS.length
                            )
                        ],
                    rotation: random(0, Math.PI * 2),
                    rotationSpeed: random(-0.24, 0.24),
                    shard: true
                });
            }
        };

        const animate = () => {
            if (!running) return;

            ctx.clearRect(0, 0, width, height);

            // Quelques petites paillettes permanentes
            if (
                !showVictory &&
                particles.length < 70 &&
                Math.random() < 0.45
            ) {
                spawnDust();
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];

                particle.vy += particle.gravity;
                particle.vx *= particle.drag;
                particle.vy *= particle.drag;

                particle.x += particle.vx;
                particle.y += particle.vy;

                particle.rotation +=
                    particle.rotationSpeed;

                particle.tw += particle.twSpeed;

                if (
                    particle.y > height + 60 ||
                    particle.x < -120 ||
                    particle.x > width + 120
                ) {
                    particles.splice(i, 1);
                    continue;
                }

                const fade =
                    particle.y > height * 0.86
                        ? Math.max(
                              0,
                              (height + 40 - particle.y) /
                                  (height * 0.14 + 40)
                          )
                        : 1;

                if (particle.shard) {
                    ctx.save();

                    ctx.globalAlpha = fade;

                    ctx.translate(
                        particle.x,
                        particle.y
                    );

                    ctx.rotate(particle.rotation);

                    ctx.fillStyle = particle.color;

                    ctx.fillRect(
                        -particle.width / 2,
                        -particle.height / 2,
                        particle.width,
                        particle.height
                    );

                    ctx.restore();
                } else {
                    ctx.globalAlpha =
                        fade *
                        (0.55 +
                            0.45 *
                                Math.sin(
                                    particle.tw
                                ));

                    ctx.fillStyle = particle.color;

                    ctx.beginPath();

                    ctx.arc(
                        particle.x,
                        particle.y,
                        particle.r,
                        0,
                        Math.PI * 2
                    );

                    ctx.fill();
                }
            }

            ctx.globalAlpha = 1;

            animationRef.current =
                requestAnimationFrame(animate);
        };

        resize();

        window.addEventListener("resize", resize);

        animationRef.current =
            requestAnimationFrame(animate);

        // Expose burst pour le submit
        canvas.burstConfetti = burst;

        return () => {
            running = false;

            window.removeEventListener(
                "resize",
                resize
            );

            if (animationRef.current) {
                cancelAnimationFrame(
                    animationRef.current
                );
            }
        };
    }, [showVictory]);

    // --------------------------------------------------
    // Animation de victoire
    // --------------------------------------------------

    const celebrate = () => {
        setShowVictory(true);

        document.body.style.overflow = "hidden";

        const reduceMotion = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (reduceMotion) {
            setBoom(true);
            return;
        }

        setTimeout(() => {
            setBoom(true);

            if (canvasRef.current?.burstConfetti) {
                canvasRef.current.burstConfetti(
                    window.innerWidth / 2,
                    window.innerHeight * 0.46
                );
            }
        }, 1250);
    };

    // Nettoyage
    useEffect(() => {
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    // --------------------------------------------------
    // Submit
    // --------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        setIsLoading(true);

        if (!isOver18) {
            toast.error(
                "Please confirm that you are over 18 years old"
            );
            setIsLoading(false);
            return;
        }

        if (
            !formData.email ||
            !formData.password ||
            !confirm ||
            !formData.name
        ) {
            toast.error("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (!validateEmail(formData.email)) {
            toast.error(
                "Please enter a valid email address"
            );
            setIsLoading(false);
            return;
        }

        if (formData.name.length < 3) {
            toast.error(
                "Le pseudo doit contenir au moins 3 caractères"
            );
            setIsLoading(false);
            return;
        }

        if (formData.password !== confirm) {
            toast.error("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            toast.error(
                "Password must contain at least 6 characters"
            );
            setIsLoading(false);
            return;
        }

        try {
            const result = await registerService(
                formData
            );

            if (result?.success) {
                setFormData({
                    email: "",
                    password: "",
                    name: ""
                });

                setConfirm("");
                setIsOver18(false);

                celebrate();
            } else {
                toast.error(
                    result?.message ||
                        "Registration failed"
                );
            }
        } catch (error) {
            console.error(
                "Erreur inscription:",
                error
            );

            toast.error(
                error?.message ||
                    "Impossible de contacter le serveur"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (
        <div
            className="register-page"
            style={{
                backgroundImage: `url(${pokerBackground})`
            }}
        >
            <div className="register-bg-overlay" />

            <ToastContainer
                position="top-right"
                theme="dark"
            />

            {/* HEADER */}
            <header className="topbar">
                <div className="wrap">
                    <a
                        className="logo"
                        href="/"
                    >
                        <b>♠</b>
                        Afripoks
                    </a>

                    <div className="account">
                        <a
                            className="btn btn-ghost"
                            href="/"
                        >
                            Retour à l'accueil
                        </a>
                    </div>
                </div>
            </header>

            {/* NAVIGATION */}
            <nav className="subnav">
                <div className="wrap">
                    <a href="/">
                        Accueil
                    </a>

                    <a href="/login">
                        <span className="tag">
                            JOUER
                        </span>
                        Cash games
                    </a>

                    <a href="/lobby#tournois">
                        <span className="tag">
                            JOUER
                        </span>
                        Tournois
                    </a>

                    <a href="/">
                        Apprendre le poker
                    </a>
                </div>
            </nav>

            {/* FORMULAIRE */}
            <section className="stage">
                <div className="panel">
                    <h1>
                        Créer un compte
                    </h1>

                    <p className="sub">
                        Deux minutes, et votre
                        siège est réservé.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="register-form"
                    >
                        {/* PSEUDO */}
                        <label htmlFor="name">
                            Pseudo
                        </label>

                        <div className="input-wrapper">
                            <User
                                size={18}
                                className="field-icon"
                            />

                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                minLength={3}
                                maxLength={30}
                                autoComplete="username"
                                placeholder="Celui que la table retiendra"
                                value={formData.name}
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        {/* EMAIL */}
                        <label htmlFor="email">
                            Email
                        </label>

                        <div className="input-wrapper">
                            <User
                                size={18}
                                className="field-icon"
                            />

                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                autoComplete="email"
                                placeholder="vous@exemple.com"
                                value={formData.email}
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        {/* PASSWORD */}
                        <label htmlFor="password">
                            Mot de passe
                        </label>

                        <div className="input-wrapper">
                            <Key
                                size={18}
                                className="field-icon"
                            />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                id="password"
                                name="password"
                                required
                                minLength={6}
                                autoComplete="new-password"
                                placeholder="6 caractères minimum"
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Masquer le mot de passe"
                                        : "Afficher le mot de passe"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff
                                        size={18}
                                    />
                                ) : (
                                    <Eye
                                        size={18}
                                    />
                                )}
                            </button>
                        </div>

                        {/* CONFIRMATION */}
                        <label htmlFor="confirm">
                            Confirmer le mot de passe
                        </label>

                        <div className="input-wrapper">
                            <Key
                                size={18}
                                className="field-icon"
                            />

                            <input
                                type={
                                    showConfirm
                                        ? "text"
                                        : "password"
                                }
                                id="confirm"
                                name="confirm"
                                required
                                minLength={6}
                                autoComplete="new-password"
                                placeholder="Retapez votre mot de passe"
                                value={confirm}
                                onChange={(e) =>
                                    setConfirm(
                                        e.target.value
                                    )
                                }
                            />

                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() =>
                                    setShowConfirm(
                                        !showConfirm
                                    )
                                }
                                aria-label={
                                    showConfirm
                                        ? "Masquer la confirmation"
                                        : "Afficher la confirmation"
                                }
                            >
                                {showConfirm ? (
                                    <EyeOff
                                        size={18}
                                    />
                                ) : (
                                    <Eye
                                        size={18}
                                    />
                                )}
                            </button>
                        </div>

                        {/* +18 */}
                        <div className="age-confirmation">
                            <label className="toggle-container">
                                <input
                                    type="checkbox"
                                    checked={isOver18}
                                    onChange={() =>
                                        setIsOver18(
                                            !isOver18
                                        )
                                    }
                                />

                                <span className="toggle-slider" />
                            </label>

                            <span className="age-text">
                                Je confirme avoir
                                plus de 18 ans
                            </span>
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="btn btn-gold submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="spinner" />
                            ) : (
                                "S'inscrire"
                            )}
                        </button>
                    </form>

                    <a
                        className="retour"
                        href="/login"
                    >
                        Vous avez déjà un compte ?
                        Se connecter
                    </a>
                </div>
            </section>

            {/* ÉCRAN DE VICTOIRE */}
            {showVictory && (
                <div
                    className={`victory ${
                        boom ? "boom" : ""
                    }`}
                    aria-live="polite"
                >
                    <div
                        className={`jetons ${
                            boom ? "gone" : ""
                        }`}
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

                    <div
                        className="vflash"
                        aria-hidden="true"
                    />

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

                    <div className="vmsg">
                        <div
                            className="grosjeton"
                            aria-hidden="true"
                        >
                            <span>OK</span>
                        </div>

                        <h2>
                            C'est fait,
                            <br />
                            tu es des nôtres
                        </h2>

                        <p>
                            Maintenant, reste à
                            voir si tu sais vraiment
                            jouer.
                            <span className="emo">
                                😎
                            </span>
                        </p>

                        <div className="cta">
                            <button
                                type="button"
                                className="btn btn-gold"
                                onClick={() =>
                                    navigate(
                                        "/login"
                                    )
                                }
                            >
                                Se connecter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CANVAS CONFETTIS */}
            <canvas
                ref={canvasRef}
                id="fx"
                aria-hidden="true"
            />
        </div>
    );
};

export default Register;
