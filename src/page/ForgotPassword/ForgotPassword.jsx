import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.scss';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [resultType, setResultType] = useState('');

    const navigate = useNavigate();
    const canvasRef = useRef(null);

    /* =========================
       POUSSIÈRE D'OR
    ========================= */

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const reduceMotion = window.matchMedia &&
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;

        if (reduceMotion) {
            canvas.style.display = 'none';
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        let width;
        let height;
        let animationFrame;

        const particles = [];

        const colors = [
            '#FFF8DC',
            '#F5DA92',
            '#E7C879',
            '#D9AE4B',
            '#C79A2E'
        ];

        const random = (min, max) => {
            return min + Math.random() * (max - min);
        };

        const resize = () => {
            const dpr = Math.min(
                window.devicePixelRatio || 1,
                2
            );

            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

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

        window.addEventListener('resize', resize);

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
                    r: random(0.8, 2.3),
                    tw: random(0, Math.PI * 2),
                    tws: random(0.04, 0.12),
                    color:
                        colors[
                            Math.floor(
                                Math.random() *
                                colors.length
                            )
                        ]
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

                if (particle.y > height + 20) {
                    particles.splice(i, 1);
                    continue;
                }

                const fade =
                    particle.y > height * 0.88
                        ? Math.max(
                            0,
                            (height + 20 - particle.y) /
                            (height * 0.12 + 20)
                        )
                        : 1;

                ctx.globalAlpha =
                    fade *
                    (
                        0.4 +
                        0.45 *
                        Math.sin(particle.tw)
                    );

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

            ctx.globalAlpha = 1;

            animationFrame =
                requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener(
                'resize',
                resize
            );

            cancelAnimationFrame(
                animationFrame
            );
        };
    }, []);

    /* =========================
       ENVOI EMAIL
    ========================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setResult(
                'Veuillez saisir votre adresse email.'
            );

            setResultType('erreur');

            return;
        }

        setLoading(true);
        setResult('Envoi en cours...');
        setResultType('');

        try {
            const response = await fetch(
                '/api/auth/forgot-password',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email.trim()
                    })
                }
            );

            if (response.status === 404) {
                setResult(
                    "Cette fonction n'est pas encore activée sur le serveur."
                );

                setResultType('erreur');
                setLoading(false);

                return;
            }

            const data = await response.json();

            if (data.success) {
                setResult(
                    'Code envoyé. Ouvrez votre boîte mail.'
                );

                setResultType('succes');

                setTimeout(() => {
                    navigate('/verify-code', { state: { email: email.trim() } });
                }, 900);

            } else {
                setResult(
                    data.message ||
                    (
                        data.errors
                            ? JSON.stringify(data.errors)
                            : 'Une erreur est survenue.'
                    )
                );

                setResultType('erreur');

                setLoading(false);
            }

        } catch (error) {
            console.error(
                'Forgot password error:',
                error
            );

            setResult(
                " de contacter le serveur. Vérifiez qu'il tourne toujours."
            );

            setResultType('erreur');

            setLoading(false);
        }
    };

    return (
        <div className="forgot-password">

            {/* =========================
                HEADER
            ========================= */}

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
                            href="/"Impossible
                        >
                            Retour à l'accueil
                        </a>

                    </div>

                </div>

            </header>


            {/* =========================
                NAVIGATION
            ========================= */}

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


            {/* =========================
                SCÈNE
            ========================= */}

            <section className="stage">

                <div className="panel">

                    <h1>
                        Mot de passe oublié
                    </h1>

                    <p className="sub">
                        Indiquez votre email, nous vous
                        envoyons un code à six chiffres.
                    </p>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            required
                            autoComplete="email"
                            placeholder="vous@exemple.com"
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />


                        <button
                            type="submit"
                            className="btn btn-gold"
                            id="btnSubmit"
                            disabled={loading}
                        >
                            {loading
                                ? 'Envoi...'
                                : 'Recevoir le code'}
                        </button>

                    </form>


                    {/* RESULTAT */}

                    <div
                        className={`resultat ${resultType}`}
                    >
                        {result}
                    </div>


                    <a
                        className="retour"
                        href="/login"
                    >
                        Revenir à la connexion
                    </a>

                </div>

            </section>


            {/* =========================
                CANVAS PARTICULES
            ========================= */}

            <canvas
                ref={canvasRef}
                id="fx"
                aria-hidden="true"
            />

        </div>
    );
};

export default ForgotPassword;