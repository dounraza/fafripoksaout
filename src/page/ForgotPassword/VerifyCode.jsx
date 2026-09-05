import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyCode, forgotPassword } from "../../page/services/authService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./VerifyCode.scss";

import {ForgotPassword } from "./ForgotPassword";

const VerifyCode = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();

    // Récupérer l'email depuis location.state ou le sessionStorage
    const [storedEmail, setStoredEmail] = useState("");

    useEffect(() => {
        const emailFromSession = sessionStorage.getItem('userEmail');
        console.log("DEBUG - sessionStorage email:", emailFromSession);
        setStoredEmail(location.state?.email || emailFromSession || "");
    }, [location.state?.email]);

    const email = storedEmail;
    const inputRefs = useRef([]);

    /*
     * Focus sur la première case au chargement
     */
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    /*
     * Compteur pour le renvoi du code
     */
    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    /*
     * Gestion de la saisie d'un chiffre
     */
    const handleChange = (index, value) => {
        // On garde uniquement les chiffres
        const numericValue = value.replace(/\D/g, "");

        // Si plusieurs chiffres sont collés dans une case,
        // on distribue les chiffres dans les différentes cases.
        if (numericValue.length > 1) {
            const newCode = [...code];

            numericValue
                .slice(0, 6 - index)
                .split("")
                .forEach((digit, offset) => {
                    newCode[index + offset] = digit;
                });

            setCode(newCode);

            const nextIndex = Math.min(
                index + numericValue.length,
                5
            );

            inputRefs.current[nextIndex]?.focus();

            return;
        }

        const newCode = [...code];
        newCode[index] = numericValue;

        setCode(newCode);

        if (numericValue && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    /*
     * Gestion du clavier
     */
    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace") {
            if (!code[index] && index > 0) {
                const newCode = [...code];
                newCode[index - 1] = "";

                setCode(newCode);
                inputRefs.current[index - 1]?.focus();
            }
        }

        if (event.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    /*
     * Gestion du collage
     */
    const handlePaste = (event) => {
        event.preventDefault();

        const pastedText = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedText) return;

        const newCode = ["", "", "", "", "", ""];

        pastedText.split("").forEach((digit, index) => {
            newCode[index] = digit;
        });

        setCode(newCode);

        const nextIndex = Math.min(pastedText.length, 5);

        inputRefs.current[nextIndex]?.focus();
    };

    /*
     * Soumission du formulaire
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("DEBUG - handleSubmit triggered");

        const codeValue = code.join("");

        if (codeValue.length !== 6) {
            toast.error("Veuillez entrer les 6 chiffres du code.");
            return;
        }

        if (!email) {
            toast.error("Adresse email introuvable.");
            return;
        }

        setLoading(true);

        window.alert("Type de vérification : " + (location.state?.type || "Non défini"));

        try {
            await verifyCode(email, codeValue, location.state?.type);

            toast.success("Code valide !");

            if (location.state?.type === 'account-verification') {
                navigate("/acceuil");
            } else {
                navigate("/reset-password", {
                    state: {
                        email,
                        code: codeValue,
                    },
                });
            }
        } catch (error) {
            console.error("Erreur vérification code :", error);

            toast.error("Code invalide ou expiré.");
        } finally {
            setLoading(false);
        }
    };

    /*
     * Renvoyer le code
     */
    const handleResend = async () => {
        if (countdown > 0 || resending) return;

        if (!email) {
            toast.error("Adresse email introuvable.");
            return;
        }

        setResending(true);

        try {
            await forgotPassword(email);

            toast.success("Un nouveau code vient de vous être envoyé.");

            // On lance le compteur de 45 secondes
            setCountdown(45);

            // On vide les cases
            setCode(["", "", "", "", "", ""]);

            inputRefs.current[0]?.focus();
        } catch (error) {
            console.error("Erreur renvoi code :", error);

            toast.error(
                "Impossible de renvoyer le code. Veuillez réessayer."
            );
        } finally {
            setResending(false);
        }
    };

    /*
     * Retour à l'accueil
     */
    const handleHome = () => {
        navigate("/");
    };

    /*
     * Retour connexion
     */
    const handleLogin = () => {
        navigate("/connexion");
    };

    return (
        <div className="verify-page">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="dark"
            />

            {/* ==================== TOP BAR ==================== */}
            <header className="verify-topbar">
                <div className="verify-wrap verify-topbar-inner">
                    <button
                        type="button"
                        className="verify-logo"
                        onClick={handleHome}
                    >
                        <span className="verify-logo-icon">
                            ♠
                        </span>

                        <span>Afripoks</span>
                    </button>

                    <div className="verify-account">
                        <button
                            type="button"
                            className="verify-btn verify-btn-ghost"
                            onClick={handleHome}
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            </header>

            {/* ==================== SUB NAV ==================== */}
            <nav className="verify-subnav">
                <div className="verify-wrap verify-subnav-inner">
                    <button
                        type="button"
                        onClick={handleHome}
                        className="verify-nav-link active"
                    >
                        Accueil
                    </button>

                    <button
                        type="button"
                        onClick={handleHome}
                        className="verify-nav-link"
                    >
                        <span className="verify-tag">
                            JOUER
                        </span>
                        Cash games
                    </button>

                    <button
                        type="button"
                        onClick={handleHome}
                        className="verify-nav-link"
                    >
                        <span className="verify-tag">
                            JOUER
                        </span>
                        Tournois
                    </button>

                    <button
                        type="button"
                        onClick={handleHome}
                        className="verify-nav-link"
                    >
                        Apprendre le poker
                    </button>
                </div>
            </nav>

            {/* ==================== STAGE ==================== */}
            <main className="verify-stage">

                {/* Poussière dorée */}
                <GoldParticles />

                {/* Panel */}
                <div className="verify-panel">

                    <h1>Votre code</h1>

                    <p className="verify-subtitle">
                        Nous avons envoyé un code à six chiffres à
                    </p>

                    <p className="verify-email">
                        {email || "votre adresse"}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div
                            className="verify-code-boxes"
                            onPaste={handlePaste}
                        >
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(element) => {
                                        inputRefs.current[index] =
                                            element;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    autoComplete={
                                        index === 0
                                            ? "one-time-code"
                                            : "off"
                                    }
                                    aria-label={`Chiffre ${
                                        index + 1
                                    }`}
                                    value={digit}
                                    onChange={(event) =>
                                        handleChange(
                                            index,
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={(event) =>
                                        handleKeyDown(
                                            index,
                                            event
                                        )
                                    }
                                    className="verify-code-input"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="verify-btn verify-btn-gold verify-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Vérification..."
                                : "Vérifier le code"}
                        </button>
                    </form>

                    {/* Renvoi */}
                    <p className="verify-resend">
                        Rien reçu ?{" "}

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={
                                countdown > 0 || resending
                            }
                        >
                            {resending
                                ? "Envoi..."
                                : countdown > 0
                                ? `Renvoyer dans ${countdown} s`
                                : "Renvoyer le code"}
                        </button>
                    </p>

                    <button
                        type="button"
                        className="verify-back"
                        onClick={handleLogin}
                    >
                        Revenir à la connexion
                    </button>
                </div>
            </main>
        </div>
    );
};


/*
 * ============================================================
 * PARTICULES DORÉES
 * ============================================================
 */

const GoldParticles = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        if (mediaQuery.matches) {
            return;
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        let animationFrame;
        let particles = [];

        const GOLD = [
            "#FFF8DC",
            "#F5DA92",
            "#E7C879",
            "#D9AE4B",
            "#C79A2E",
        ];

        let width = 0;
        let height = 0;
        let dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        const random = (min, max) => {
            return (
                min +
                Math.random() * (max - min)
            );
        };

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;

            dpr = Math.min(
                window.devicePixelRatio || 1,
                2
            );

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );
        };

        resize();

        window.addEventListener(
            "resize",
            resize
        );

        const animate = () => {
            ctx.clearRect(
                0,
                0,
                width,
                height
            );

            if (
                particles.length < 55 &&
                Math.random() < 0.4
            ) {
                particles.push({
                    x: random(0, width),
                    y: -10,
                    vx: random(-0.35, 0.35),
                    vy: random(0.35, 1.2),
                    radius: random(0.8, 2.3),
                    twinkle: random(0, Math.PI * 2),
                    twinkleSpeed: random(
                        0.04,
                        0.12
                    ),
                    color:
                        GOLD[
                            Math.floor(
                                Math.random() *
                                    GOLD.length
                            )
                        ],
                });
            }

            for (
                let i = particles.length - 1;
                i >= 0;
                i--
            ) {
                const particle = particles[i];

                particle.y += particle.vy;
                particle.x += particle.vx;
                particle.twinkle +=
                    particle.twinkleSpeed;

                if (particle.y > height + 20) {
                    particles.splice(i, 1);
                    continue;
                }

                const bottomFade =
                    particle.y >
                    height * 0.88
                        ? Math.max(
                              0,
                              (height +
                                  20 -
                                  particle.y) /
                                  (height *
                                      0.12 +
                                      20)
                          )
                        : 1;

                ctx.globalAlpha =
                    bottomFade *
                    (0.4 +
                        0.45 *
                            Math.sin(
                                particle.twinkle
                            ));

                ctx.fillStyle =
                    particle.color;

                ctx.beginPath();

                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.radius,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }

            ctx.globalAlpha = 1;

            animationFrame =
                requestAnimationFrame(
                    animate
                );
        };

        animate();

        return () => {
            window.removeEventListener(
                "resize",
                resize
            );

            cancelAnimationFrame(
                animationFrame
            );
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="verify-particles"
            aria-hidden="true"
        />
    );
};

export default VerifyCode;