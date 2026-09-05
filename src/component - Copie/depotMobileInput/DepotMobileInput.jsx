import { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";
import { depot as depotService } from "../../services/depotMobileService";
import { getEnvoie as compte } from "../../services/envoieService";

import "react-phone-number-input/style.css";
import "./DepotMobileInput.scss";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const DepotMobileInput = ({ isVerified }) => {
    const [pseudo, setPseudo] = useState(sessionStorage.getItem("userName") || "");
    const [amount, setAmount] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [name, setName] = useState("");
    const [ref, setRef] = useState("");
    const [compteEnvoie, setCompteEnvoie] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const navigate = useNavigate();

    const getCompte = async () => {
        await compte(setCompteEnvoie);
    };

    const cancelTransac = () => {
        setAmount("");
        setPhoneNumber("");
        setRef("");
        setName("");
        navigate("/acceuil");
    };

    const isValid = () => {
        if (
            !isVerified || // Disable if not verified
            pseudo.trim() === "" ||
            amount === "" ||
            Number(amount) <= 0 ||
            !phoneNumber ||
            name.trim() === "" ||
            ref.trim() === ""
        ) {
            return false;
        }

        return true;
    };

    const createConfetti = () => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        const colors = [
            "#c0392b",
            "#1f6b3a",
            "#e0b84a",
            "#1a3a6b",
            "#111111",
            "#f0c14b",
            "#fff6e0",
        ];

        const chips = Array.from({ length: 64 }, () => ({
            x: width * 0.08 + Math.random() * width * 0.84,
            y: -80 - Math.random() * 320,
            r: 16 + Math.random() * 28,
            vy: 2.4 + Math.random() * 5.2,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.16,
            color: colors[(Math.random() * colors.length) | 0],
        }));

        const dust = Array.from({ length: 1600 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 16;

            return {
                x: width / 2,
                y: height * 0.42,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2.4,
                life: 1,
                size: 1.1 + Math.random() * 3.6,
                color:
                    Math.random() > 0.3
                        ? "#f6d98a"
                        : "#fff6e0",
            };
        });

        let frame = 0;

        const tick = () => {
            frame++;

            ctx.clearRect(0, 0, width, height);

            // Paillettes
            for (const particle of dust) {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.09;
                particle.life -= 0.005;

                if (particle.life <= 0) continue;

                ctx.globalAlpha = Math.max(0, particle.life);
                ctx.fillStyle = particle.color;

                ctx.beginPath();
                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.size,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            ctx.globalAlpha = 1;

            // Jetons
            for (const chip of chips) {
                chip.y += chip.vy;
                chip.rot += chip.vr;

                if (chip.y < height + 70) {
                    ctx.save();

                    ctx.translate(chip.x, chip.y);
                    ctx.rotate(chip.rot);

                    ctx.fillStyle = chip.color;

                    ctx.beginPath();
                    ctx.arc(0, 0, chip.r, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = "#ffe7a0";
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 4]);

                    ctx.beginPath();
                    ctx.arc(
                        0,
                        0,
                        chip.r - 5,
                        0,
                        Math.PI * 2
                    );
                    ctx.stroke();

                    ctx.restore();
                }
            }

            ctx.globalAlpha = 1;

            if (frame < 420) {
                animationRef.current = requestAnimationFrame(tick);
            }
        };

        animationRef.current = requestAnimationFrame(tick);
    };

    const closeSuccess = () => {
        setShowSuccess(false);

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        document.body.style.overflow = "";
    };

    const saveTransac = async () => {
        if (!isValid()) {
            toast.error(
                "Veuillez remplir tous les champs correctement !"
            );
            return;
        }

        const data = {
            pseudo,
            montant: amount,
            numero: phoneNumber,
            nom: name,
            reference: ref,
        };

        try {
            setIsLoading(true);

            await depotService(data);

            // On vide les champs après l'envoi
            setAmount("");
            setPhoneNumber("");
            setRef("");
            setName("");

            // Affichage de l'écran de succès
            setShowSuccess(true);
            document.body.style.overflow = "hidden";

            setTimeout(() => {
                createConfetti();
            }, 100);
        } catch (error) {
            toast.error(
                error?.message ||
                "Une erreur est survenue lors du dépôt."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getCompte();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            document.body.style.overflow = "";
        };
    }, []);

    return (
        <>
            <div className="depot-page">

                <header className="depot-header">
                    <div className="depot-wrap depot-bar">
                        <div className="depot-brand">
                            Afripoks
                        </div>

                        <button
                            type="button"
                            className="depot-btn depot-btn-out"
                            onClick={() => navigate("/acceuil")}
                        >
                            Accueil
                        </button>
                    </div>
                </header>

                <main className="depot-wrap depot-main">

                    <h1>Dépôt</h1>

                    <p className="depot-sub">
                        Recharge ta cave. Mobile Money uniquement.
                    </p>

                    {!isVerified && (
                        <div className="alert-message-red">
                            <p>Votre compte n'est pas encore vérifié. Veuillez le vérifier pour effectuer un dépôt.</p>
                            <button
                                className="btn-verify"
                                onClick={() => navigate("/verify-code", { state: { type: 'account-verification' } })}
                            >
                                Vérifier mon compte
                            </button>
                        </div>
                    )}

                    {/* Informations Mobile Money */}
                    <div className="nums">

                        <div>
                            <small>Orange Money</small>
                            032 09 283 35
                        </div>

                        <div>
                            <small>MVola</small>
                            038 28 694 33
                        </div>

                        <div>
                            <small>Airtel Money</small>
                            033 14 918 48
                        </div>

                    </div>

                    <div className={`depot-form ${!isVerified ? "depot-form-disabled" : ""}`}>

                        {/* Pseudo */}
                        <div className="input-group">
                            <div className="label">
                                Pseudo
                            </div>

                            <div className="input">
                                <input
                                    type="text"
                                    value={pseudo}
                                    onChange={(e) =>
                                        setPseudo(e.target.value)
                                    }
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Numéro */}
                        <div className="input-group">
                            <div className="label">
                                Numéro Mobile Money
                            </div>

                            <div className="input phone-input">
                                <PhoneInput
                                    defaultCountry="MG"
                                    placeholder="Entrez votre numéro"
                                    value={phoneNumber}
                                    onChange={setPhoneNumber}
                                />
                            </div>
                        </div>

                        {/* Référence */}
                        <div className="input-group">
                            <div className="label">
                                Référence *
                            </div>

                            <div className="input">
                                <input
                                    type="text"
                                    value={ref}
                                    onChange={(e) =>
                                        setRef(e.target.value)
                                    }
                                    placeholder="Ref / Trans ID"
                                />
                            </div>
                        </div>

                        {/* Montant */}
                        <div className="input-group">
                            <div className="label">
                                Montant
                            </div>

                            <div className="input">
                                <input
                                    type="number"
                                    min="100"
                                    step="100"
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(e.target.value)
                                    }
                                    placeholder="Montant du dépôt"
                                />
                            </div>
                        </div>

                        {/* Nom */}
                        <div className="input-group">
                            <div className="label">
                                Nom lié au Mobile Money
                            </div>

                            <div className="input">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Nom du titulaire"
                                />
                            </div>
                        </div>

                        <div className="depot-actions">

                            <button
                                type="button"
                                className="cancel"
                                onClick={cancelTransac}
                                disabled={isLoading}
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                className="submit"
                                onClick={saveTransac}
                                disabled={isLoading || !isVerified}
                            >
                                {isLoading ? (
                                    <span className="depot-spinner"></span>
                                ) : (
                                    isVerified ? "Envoyer le dépôt" : "Compte non vérifié"
                                )}
                            </button>

                        </div>

                        <p className="help">
                            * Comment faire un dépôt ? Il faudra
                            d'abord envoyer le paiement (le montant de
                            votre cave choisi) vers l'un des numéros
                            ci-dessus. Une fois envoyé, votre opérateur
                            vous enverra un message où il y a une
                            référence de paiement (ref, trans ID, etc.)
                            et c'est cette dernière que vous allez
                            placer sur la case référence.
                        </p>

                        <p className="punch">
                            Allez, montre-nous ce que tu as dans le
                            ventre 🔥💪
                        </p>

                    </div>

                    <footer className="depot-footer">
                        <button
                            type="button"
                            onClick={() => navigate("/retrait")}
                        >
                            Faire un retrait
                        </button>
                    </footer>

                </main>
            </div>

            {/* Écran de succès */}
            {showSuccess && (
                <div
                    className="depot-splash"
                    onClick={closeSuccess}
                >
                    <canvas
                        ref={canvasRef}
                        className="glitter"
                    />

                    <div
                        className="success-message"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="success-chip">
                            OK
                        </div>

                        <h2>
                            Super, ton dépôt se fera dans quelques
                            instants
                        </h2>

                        <p>
                            On vérifie ta référence et ton paiement.
                        </p>

                        <button
                            type="button"
                            className="success-button"
                            onClick={closeSuccess}
                        >
                            Continuer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default DepotMobileInput;
