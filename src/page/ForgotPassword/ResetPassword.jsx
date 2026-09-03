import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "./ResetPassword.scss";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [loading, setLoading] = useState(false);
    const [resultat, setResultat] = useState("");
    const [resultatType, setResultatType] = useState("");

    // Récupération de l'email et du code envoyés
    // depuis VerifyCode.jsx
    const email = location.state?.email || "";
    const code = location.state?.code || "";

    // =====================================================
    // PARTICULES D'OR
    // =====================================================

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const reduceMotion =
            window.matchMedia &&
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

        if (reduceMotion) {
            canvas.style.display = "none";
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

        const DPR = Math.min(
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

            canvas.width = width * DPR;
            canvas.height = height * DPR;

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.setTransform(
                DPR,
                0,
                0,
                DPR,
                0,
                0
            );
        };

        resize();

        window.addEventListener(
            "resize",
            resize
        );

        const tick = () => {
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
                    r: random(0.8, 2.3),
                    tw: random(0, Math.PI * 2),
                    tws: random(0.04, 0.12),
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
                particle.tw += particle.tws;

                if (
                    particle.y >
                    height + 20
                ) {
                    particles.splice(i, 1);
                    continue;
                }

                const fade =
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
                    fade *
                    (0.4 +
                        0.45 *
                            Math.sin(
                                particle.tw
                            ));

                ctx.fillStyle =
                    particle.color;

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

            ctx.globalAlpha = 1;

            animationFrame =
                requestAnimationFrame(tick);
        };

        tick();

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

    // =====================================================
    // VALIDATION DU FORMULAIRE
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setResultat("");
        setResultatType("");

        // Vérifier qu'on possède bien les informations
        // venant de VerifyCode
        if (!email || !code) {
            setResultat(
                "Votre session de réinitialisation est invalide ou expirée."
            );

            setResultatType("erreur");

            toast.error(
                "Session de réinitialisation invalide."
            );

            return;
        }

        // Vérification longueur mot de passe
        if (password.length < 8) {
            setResultat(
                "Le mot de passe doit contenir au moins 8 caractères."
            );

            setResultatType("erreur");

            toast.error(
                "Le mot de passe doit contenir au moins 8 caractères."
            );

            return;
        }

        // Vérification des deux mots de passe
        if (password !== password2) {
            setResultat(
                "Les deux mots de passe ne sont pas identiques."
            );

            setResultatType("erreur");

            toast.error(
                "Les deux mots de passe ne sont pas identiques."
            );

            return;
        }

        setLoading(true);

        setResultat(
            "Enregistrement..."
        );

        setResultatType("");

        try {
            // Appel de ton service existant
            const response =
                await resetPassword(
                    email,
                    code,
                    password
                );

            /*
             * Ton authService peut retourner directement
             * les données du backend ou une réponse Axios.
             */
            const data =
                response?.data || response;

            // Si le backend indique explicitement un échec
            if (
                data &&
                data.success === false
            ) {
                throw new Error(
                    data.message ||
                        "Impossible de réinitialiser le mot de passe."
                );
            }

            // Succès
            setResultat(
                "C'est enregistré. Vous pouvez vous reconnecter."
            );

            setResultatType("succes");

            toast.success(
                "Mot de passe mis à jour !"
            );

            // Nettoyer les champs
            setPassword("");
            setPassword2("");

            // Redirection vers Login
            setTimeout(() => {
                navigate("/login");
            }, 1800);
        } catch (error) {
            console.error(
                "Erreur reset password :",
                error
            );

            let message =
                "Impossible de réinitialiser le mot de passe.";

            // Message venant du backend
            if (
                error?.response?.data?.message
            ) {
                message =
                    error.response.data.message;
            } else if (error?.message) {
                message = error.message;
            }

            setResultat(message);
            setResultatType("erreur");

            toast.error(message);

            setLoading(false);
        }
    };

    // =====================================================
    // RETOUR À LA CONNEXION
    // =====================================================

    const handleLoginClick = (e) => {
        e.preventDefault();

        navigate("/login");
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="reset-password-page">

            {/* Toast */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            {/* ==========================================
                HEADER
            ========================================== */}

            <header className="topbar">
                <div className="wrap">

                    <a
                        href="/"
                        className="logo"
                    >
                        <b>♠</b>
                        Afripoks
                    </a>

                    <div className="account">

                        <a
                            href="/"
                            className="btn btn-ghost"
                        >
                            Retour à l'accueil
                        </a>

                    </div>

                </div>
            </header>

            {/* ==========================================
                NAVIGATION
            ========================================== */}

            <nav className="subnav">

                <div className="wrap">

                    <a href="/">
                        Accueil
                    </a>

                    <a href="/lobby">
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

            {/* ==========================================
                STAGE
            ========================================== */}

            <section className="stage">

                <div className="panel">

                    <h1>
                        Nouveau mot de passe
                    </h1>

                    <p className="sub">
                        Choisissez-en un solide,
                        et gardez-le pour vous.
                    </p>

                    {/* ==================================
                        FORMULAIRE
                    ================================== */}

                    <form
                        onSubmit={handleSubmit}
                        id="formulaireNouveau"
                    >

                        {/* Nouveau mot de passe */}
                        <label htmlFor="password">
                            Nouveau mot de passe
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            required
                            minLength={8}
                            autoComplete="new-password"
                            placeholder="Majuscule, minuscule, chiffre"
                            disabled={loading}
                        />

                        {/* Confirmation */}
                        <label htmlFor="password2">
                            Confirmer le mot de passe
                        </label>

                        <input
                            id="password2"
                            type="password"
                            value={password2}
                            onChange={(e) =>
                                setPassword2(
                                    e.target.value
                                )
                            }
                            required
                            minLength={8}
                            autoComplete="new-password"
                            placeholder="Le même, pour être sûr"
                            disabled={loading}
                        />

                        {/* Bouton */}
                        <button
                            type="submit"
                            className="btn btn-gold"
                            id="btnSubmit"
                            disabled={loading}
                        >
                            {loading
                                ? "Enregistrement..."
                                : "Enregistrer"}
                        </button>

                    </form>

                    {/* ==================================
                        RESULTAT
                    ================================== */}

                    {resultat && (
                        <div
                            id="resultat"
                            className={
                                resultatType
                            }
                            role="alert"
                        >
                            {resultat}
                        </div>
                    )}

                    {/* ==================================
                        RETOUR
                    ================================== */}

                    <a
                        href="/login"
                        className="retour"
                        onClick={
                            handleLoginClick
                        }
                    >
                        Revenir à la connexion
                    </a>

                </div>

            </section>

            {/* ==========================================
                GOLD PARTICLES
            ========================================== */}

            <canvas
                ref={canvasRef}
                id="fx"
                aria-hidden="true"
            />

        </div>
    );
};

export default ResetPassword;