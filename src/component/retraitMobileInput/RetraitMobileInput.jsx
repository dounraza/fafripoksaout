import { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";
import { retrait as retraitService } from "../../services/RetraitMobileService";
import { isUserInTable } from "../../services/tableServices";

import "react-phone-number-input/style.css";
import "./RetraitMobileInput.scss";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const RetraitMobileInput = () => {
    const [pseudo, setPseudo] = useState(
        sessionStorage.getItem("userName") || ""
    );
    const [amount, setAmount] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [name, setName] = useState("");
    const [balance, setBalance] = useState(0);
    const [showSplash, setShowSplash] = useState(false);

    const canvasRef = useRef(null);
    const navigate = useNavigate();

    /*
     * Récupération du solde disponible.
     * On garde cette partie car elle correspond au comportement
     * de ton nouveau HTML.
     */
    useEffect(() => {
        const available = Math.max(
            0,
            Number(localStorage.getItem("afripoks.bankroll") || 0)
        );

        setBalance(available);
    }, []);

    /*
     * Animation confettis
     */
    useEffect(() => {
        if (!showSplash) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener("resize", resize);

        const w = canvas.width;
        const h = canvas.height;

        const colors = [
            "#c0392b",
            "#1f6b3a",
            "#e0b84a",
            "#1a3a6b",
            "#111",
            "#f0c14b"
        ];

        const chips = Array.from({ length: 64 }, () => ({
            x: w * 0.08 + Math.random() * w * 0.84,
            y: -80 - Math.random() * 320,
            r: 16 + Math.random() * 28,
            vy: 2.4 + Math.random() * 5.2,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.16,
            c: colors[(Math.random() * colors.length) | 0]
        }));

        const dust = Array.from({ length: 1600 }, () => {
            const ang = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 16;

            return {
                x: w / 2,
                y: h * 0.42,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 2.4,
                life: 1,
                size: 1.1 + Math.random() * 3.6,
                g:
                    Math.random() > 0.3
                        ? "#f6d98a"
                        : "#fff6e0"
            };
        });

        let frame = 0;
        let animationFrame;

        const tick = () => {
            frame += 1;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Petites particules
            for (const p of dust) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.09;
                p.life -= 0.005;

                if (p.life <= 0) continue;

                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.g;

                ctx.beginPath();
                ctx.arc(
                    p.x,
                    p.y,
                    p.size,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            ctx.globalAlpha = 1;

            // Jetons/confettis
            for (const c of chips) {
                c.y += c.vy;
                c.rot += c.vr;

                if (c.y < h + 70) {
                    ctx.save();

                    ctx.translate(c.x, c.y);
                    ctx.rotate(c.rot);

                    ctx.fillStyle = c.c;

                    ctx.beginPath();
                    ctx.arc(
                        0,
                        0,
                        c.r,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();

                    ctx.strokeStyle = "#ffe7a0";
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 4]);

                    ctx.beginPath();
                    ctx.arc(
                        0,
                        0,
                        c.r - 5,
                        0,
                        Math.PI * 2
                    );
                    ctx.stroke();

                    ctx.restore();
                }
            }

            if (frame < 420) {
                animationFrame = requestAnimationFrame(tick);
            }
        };

        tick();

        return () => {
            window.removeEventListener("resize", resize);

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [showSplash]);

    const cancelTransac = () => {
        setAmount("");
        setPhoneNumber("");
        setName("");

        navigate("/acceuil");
    };

    const isValid = () => {
        if (
            !pseudo ||
            !amount ||
            !phoneNumber ||
            !name
        ) {
            return false;
        }

        if (Number(amount) <= 0) {
            return false;
        }

        if (Number(amount) < 100) {
            return false;
        }

        return true;
    };

    const saveTransac = async () => {
        if (!isValid()) {
            toast.error(
                "Veuillez remplir tous les champs correctement !"
            );
            return;
        }

        const amountNumber = Number(amount);

        /*
         * Vérification du solde local comme dans le nouveau HTML.
         */
        const currentBalance = Math.max(
            0,
            Number(localStorage.getItem("afripoks.bankroll") || 0)
        );

        if (amountNumber > currentBalance) {
            setBalance(currentBalance);

            toast.error(
                `Impossible. Ton solde est de ${currentBalance.toLocaleString(
                    "fr-FR"
                )} Ar.`
            );

            return;
        }

        try {
            /*
             * Vérification si le joueur est encore à une table.
             */
            const userId = sessionStorage.getItem("userId");
            const userInTable = await isUserInTable(userId);

            if (userInTable) {
                toast.error(
                    "Vous devez d'abord quitter la table."
                );
                return;
            }

            const data = {
                pseudo: pseudo,
                montant: amountNumber,
                numero: phoneNumber,
                nom: name
            };

            /*
             * Envoi au backend.
             */
            await retraitService(data);

            /*
             * Mise à jour du solde local.
             */
            const newBalance = Math.max(
                0,
                currentBalance - amountNumber
            );

            localStorage.setItem(
                "afripoks.bankroll",
                String(newBalance)
            );

            setBalance(newBalance);

            /*
             * Mise à jour éventuelle des balances par pseudo.
             */
            try {
                const bals = JSON.parse(
                    localStorage.getItem(
                        "afripoks.balances"
                    ) || "{}"
                );

                const map = Array.isArray(bals) ? {} : bals;
                const key = pseudo || "Joueur";

                map[key] = Math.max(
                    0,
                    (Number(map[key]) || 0) - amountNumber
                );

                localStorage.setItem(
                    "afripoks.balances",
                    JSON.stringify(map)
                );
            } catch (error) {
                console.error(
                    "Erreur mise à jour balance :",
                    error
                );
            }

            setAmount("");
            setPhoneNumber("");
            setName("");

            /*
             * Affichage du succès + confettis.
             */
            setShowSplash(true);
        } catch (error) {
            toast.error(
                error?.message ||
                    "Une erreur est survenue lors du retrait."
            );
        }
    };

    const closeSplash = () => {
        setShowSplash(false);
        navigate("/acceuil");
    };

    return (
        <>
      
   <header className="retrait-header">
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
            <div className="retrait-page">
                <div className="retrait-container">

                    <h1>RETRAIT</h1>

                    <p className="retrait-sub">
                        Récupère tes jetons sur ton Mobile Money.
                    </p>

                    <form
                        className="retrait-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            saveTransac();
                        }}
                    >
                        <div className="input-group">
                            <label>Pseudo</label>

                            <input
                                type="text"
                                value={pseudo}
                                onChange={(e) =>
                                    setPseudo(e.target.value)
                                }
                                disabled
                            />
                        </div>

                        <div className="input-group">
                            <label>
                                Numéro Mobile Money
                            </label>

                            <PhoneInput
                                defaultCountry="MG"
                                placeholder="Entrez votre numéro"
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                            />
                        </div>

                        <div className="input-group">
                            <label>Montant</label>

                            <input
                                type="number"
                                min="100"
                                step="100"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(e.target.value)
                                }
                            />
                        </div>

                        <p className="balance-hint">
                            Solde disponible :{" "}
                            <strong>
                                {balance.toLocaleString(
                                    "fr-FR"
                                )}{" "}
                                Ar
                            </strong>
                            . Tu ne peux pas retirer plus.
                        </p>

                        <div className="input-group">
                            <label>
                                Nom lié au Mobile Money
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                            />
                        </div>

                        <div className="retrait-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={cancelTransac}
                            >
                                Annuler
                            </button>

                            <button
                                type="submit"
                                className="go"
                            >
                                Demander le retrait
                            </button>
                        </div>

                        <p className="help">
                            Le retrait part vers le numéro
                            Mobile Money indiqué. Tes fonds
                            arrivent bientôt. Un prélèvement de
                            5 % s’applique sur chaque main à la
                            table, pas sur ce retrait.
                        </p>

                        <p className="punch">
                            Tu prends l’argent et tu t’enfuis
                            😂🏃
                        </p>
                    </form>

                    <div className="retrait-footer">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/depot")
                            }
                        >
                            Faire un dépôt
                        </button>
                    </div>
                </div>
            </div>

            {showSplash && (
                <div
                    className="retrait-splash"
                    onClick={closeSplash}
                >
                    <canvas ref={canvasRef} />

                    <div
                        className="splash-message"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="splash-chip">
                            OK
                        </div>

                        <h2>
                            Retrait effectué, ton argent
                            arrivera bientôt sur ton
                            Mobile Money
                        </h2>

                        <button
                            type="button"
                            onClick={closeSplash}
                            className="splash-close"
                        >
                            Continuer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default RetraitMobileInput;