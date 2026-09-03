import React, { useEffect, useMemo, useState } from "react";
import "./acceuil.scss";
import { getAll } from "../../services/tableServices";
import { getSolde } from "../../services/soldeService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Users, Wallet, RotateCcw } from 'lucide-react';
import { getFullAvatarUrl } from '../../services/api';
// Table welcome messages mapping
const WELCOME = {
  "La Table des Mauvaises Décisions": "Bienvenue. Mauvaise idée ?",
  "Bluff ou Crève": "Bienvenue. Bluffe bien.",
  "Le Cimetière des Bankrolls": "Bienvenue. RIP tes jetons.",
  "All-In ou Rien": "Bienvenue. Pas de marche arrière.",
  "Les Cerveaux en Tilt": "Bienvenue. Garde ton calme.",
  "La Table en Feu": "Bienvenue. Ça va chauffer.",
  "Ne Regarde Pas Mes Cartes": "Bienvenue. On t’a vu.",
  "Le Sang-Froid": "Bienvenue. Tu vas en avoir besoin.",
  "Poker Face": "Bienvenue. Ne tremble pas.",
  "Ici, Ça Part en Jetons": "Bienvenue. Garde-les si tu peux.",
  "L'Aquarium": "Bienvenue. Évite d’être le poisson.",
  "La Fosse aux Requins": "Bienvenue. Ne saigne pas.",
  "Les As du Dimanche": "Bienvenue. Prouve-le.",
  "Zone de Tilt": "Bienvenue. Ça commence maintenant.",
  "La Table des Égos": "Bienvenue. Tout le monde se croit fort.",
  "Le Bluffeur Anonyme": "Bienvenue. On va te démasquer.",
  "Ça Va Partir en All-In": "Bienvenue. Fais tes adieux.",
  "La Chance des Débutants": "Bienvenue. Profite-en vite.",
  "T'as Vraiment Ça ?": "Bienvenue. Prouve-le.",
  "Pas de Pitié": "Bienvenue. T’es prévenu.",
  "Le Jackpot des Audacieux": "Bienvenue. Ose tout.",
  "Dernière Main": "Bienvenue. Profite du voyage.",
};

const formatAr = (n) =>
  `${new Intl.NumberFormat("fr-FR").format(n)} Ar`;

function getUserName(user) {
  if (!user) return "";
  if (typeof user === "string") return user;

  return (
    user.pseudo ||
    user.username ||
    user.name ||
    user.displayName ||
    user.email ||
    ""
  );
}

function Stage({ fx }) {
  switch (fx) {
    case "clover":
      return (
        <div className="stage">
          <svg className="clover" viewBox="0 0 64 80">
            <circle cx="32" cy="22" r="11" fill="#3dba5a" />
            <circle cx="21" cy="34" r="11" fill="#3dba5a" />
            <circle cx="43" cy="34" r="11" fill="#3dba5a" />
            <circle cx="32" cy="44" r="11" fill="#3dba5a" />
            <rect x="30" y="44" width="4" height="30" fill="#2a7a38" />
          </svg>
        </div>
      );

    case "fish":
      return (
        <div className="stage">
          <svg className="fish fish-a" viewBox="0 0 64 32">
            <ellipse
              cx="28"
              cy="16"
              rx="18"
              ry="10"
              fill="#5ad0c8"
            />
            <polygon
              points="46,16 62,6 62,26"
              fill="#2a8f88"
            />
            <circle cx="20" cy="14" r="2" fill="#082018" />
          </svg>

          <svg className="fish fish-b" viewBox="0 0 64 32">
            <ellipse
              cx="28"
              cy="16"
              rx="16"
              ry="8"
              fill="#f0c14b"
            />
            <polygon
              points="44,16 60,8 60,24"
              fill="#b8860b"
            />
            <circle cx="20" cy="14" r="2" fill="#3a2808" />
          </svg>
        </div>
      );

    case "eye":
      return (
        <div className="stage">
          <svg className="eye" viewBox="0 0 80 44">
            <ellipse
              cx="40"
              cy="22"
              rx="36"
              ry="18"
              fill="#f3e6c8"
            />
            <circle cx="40" cy="22" r="10" fill="#1a080c" />
            <circle cx="43" cy="19" r="3" fill="#fff" />
          </svg>
        </div>
      );

    case "mask":
      return (
        <div className="stage">
          <svg className="mask" viewBox="0 0 80 54">
            <path
              d="M8 22 Q40 4 72 22 Q72 40 40 50 Q8 40 8 22Z"
              fill="#1a0a14"
              stroke="#e0b84a"
              strokeWidth="2"
            />
            <ellipse
              cx="28"
              cy="26"
              rx="8"
              ry="6"
              fill="#c9a0ff"
            />
            <ellipse
              cx="52"
              cy="26"
              rx="8"
              ry="6"
              fill="#c9a0ff"
            />
          </svg>
        </div>
      );

    case "ice":
      return (
        <div className="stage">
          {[16, 34, 52, 70, 84].map((left, i) => (
            <span
              key={left}
              className="bit flake"
              style={{
                left: `${left}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      );

    case "chips":
      return (
        <div className="stage">
          {["#c0392b", "#1f6b3a", "#e0b84a", "#1a3a6b"].map(
            (color, i) => (
              <span
                key={i}
                className={`bit chip chip-${i + 1}`}
                style={{ background: color }}
              />
            )
          )}
        </div>
      );

    case "fire":
      return (
        <div className="stage">
          {[28, 46, 62].map((left) => (
            <span
              key={left}
              className="bit flame"
              style={{ left: `${left}%` }}
            />
          ))}
        </div>
      );

    case "shark":
      return (
        <div className="stage">
          <svg className="shark" viewBox="0 0 90 28">
            <path
              d="M4 18 L50 10 L86 16 L50 22 Z"
              fill="#102030"
            />
            <polygon
              points="40,10 48,0 52,12"
              fill="#102030"
            />
          </svg>
        </div>
      );

    case "coins":
      return (
        <div className="stage">
          {[20, 46, 68, 82].map((left, i) => (
            <span
              key={left}
              className="bit coinbit"
              style={{
                left: `${left}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      );

    case "fuse":
      return (
        <div className="stage">
          <span className="bit spark" />
        </div>
      );

    case "mist":
      return (
        <div className="stage">
          <span className="bit fog" />
        </div>
      );

    case "ego":
      return (
        <div className="stage">
          <span
            className="bit star"
            style={{
              left: "20%",
              top: "28%",
              width: "9px",
              height: "9px",
            }}
          />
          <span
            className="bit star"
            style={{
              left: "70%",
              top: "22%",
              width: "7px",
              height: "7px",
            }}
          />
        </div>
      );

    case "ask":
      return (
        <div className="stage">
          <span className="bit q">?</span>
        </div>
      );

    case "steam":
      return (
        <div className="stage">
          {[44, 50, 56].map((left, i) => (
            <span
              key={left}
              className="bit vap"
              style={{
                left: `${left}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      );

    default:
      return <div className="stage" />;
  }
}

function TableCard({ table, onEnter, sitCount }) {
  return (
    <button
      type="button"
      className="card"
      data-fx={table.fx}
      onClick={() => onEnter(table)}
    >
      {table.fx === "fire" && <div className="heat" />}

      <img
        className="bg"
        src={table.img}
        alt=""
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      <Stage fx={table.fx} />

      <div className="shade" />

      <div className="top">
        <span className="pill">
          {table.kind === "tournoi" && "Tournoi · "}
          {table.v === "omaha" ? "Omaha" : "Texas Hold'em"}
        </span>

        <span className="seats">{sitCount || 0} / 9</span>
      </div>

      <div className="bottom">
        <h3 className={`t-${table.color}`}>
          {table.name}
        </h3>

        <p className="joke">{table.tag}</p>

        <div className="meta">
          <div>
            Cave
            <b>{formatAr(table.cave || table.buy)}</b>
          </div>

          <div>
            Blindes (SB / BB)
            <b>
              {formatAr(table.smallBlind || (table.blinds ? table.blinds[0] : 0))} / {formatAr(table.bigBlind || (table.blinds ? table.blinds[1] : 0))}
            </b>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function Accueil() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  
  // State variables
  const [tables, setTables] = useState([]);
  const [sitCounts, setSitCounts] = useState(new Map());
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cave, setCave] = useState("");
  const [seat, setSeat] = useState(null);
  const [enter, setEnter] = useState(false);
  const [enterOpen, setEnterOpen] = useState(false);
  const [enterShow, setEnterShow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastTableId, setLastTableId] = useState(sessionStorage.getItem('lastTableId'));

  // Fetch tables on component mount
  useEffect(() => {
    getAll(setTables, setSitCounts).catch((err) =>
      console.error("Error fetching tables:", err)
    );
  }, []);

  const lastTable = useMemo(() => {
    return lastTableId && tables.length > 0 
        ? tables.find(t => Number(t.id) === Number(lastTableId)) 
        : null;
  }, [lastTableId, tables]);

  // Fetch balance when user changes
  useEffect(() => {
    // Try to get userId from sessionStorage if user object doesn't have it
    const idToFetch = user?.id || sessionStorage.getItem('userId');
    
    if (idToFetch) {
        getSolde(idToFetch, setBalance).catch((err) =>
            console.error("Error fetching balance:", err)
        );
    }
  }, [user]);

  const filteredTables = useMemo(() => {
    const q = query.toLowerCase().trim();

    return tables.filter((table) => {
      if (filter === "tournoi" && table.kind !== "tournoi") {
        return false;
      }

      // Check both 'v' and 'gameType' properties
      const gameType = (table.v || table.gameType || "").toLowerCase();
      const filterValue = filter.toLowerCase();

      if (
        (filter === "holdem" || filter === "omaha") &&
        gameType !== filterValue
      ) {
        return false;
      }

      if (q && !table.name.toLowerCase().includes(q)) {
        return false;
      }

      return true;
    });
  }, [query, filter, tables]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("afripoks.user");

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    try {
      const storedSeat = localStorage.getItem("afripoks.seat");

      if (storedSeat) {
        const parsedSeat = JSON.parse(storedSeat);
        console.log("DEBUG [Seat object]:", parsedSeat);
        setSeat(parsedSeat);
      }
    } catch {
      setSeat(null);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const name = getUserName(user);

    let bank = Number(
      localStorage.getItem("afripoks.bankroll") || 0
    );

    if (!bank) {
      try {
        const wallet = JSON.parse(
          localStorage.getItem("afripoks.wallet") || "[]"
        );

        bank = wallet.reduce((total, row) => {
          const status =
            row.status === "en_attente" || !row.status
              ? "attente"
              : row.status;

          if (status !== "valide") return total;

          const amount = Number(
            row.amount || row.montant || 0
          );

          return row.kind === "retrait"
            ? total - amount
            : total + amount;
        }, 0);

        bank = Math.max(0, bank);

        localStorage.setItem(
          "afripoks.bankroll",
          String(bank)
        );
      } catch {
        bank = 0;
      }
    }

    setBalance(bank);

    if (name) {
      try {
        localStorage.setItem(
          "afripoks.user",
          JSON.stringify({
            name,
            email: user.email || "",
            photo: user.photo || "",
          })
        );
      } catch {
        // rien
      }
    }
  }, [user]);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);

    document.addEventListener("click", closeMenu);

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const raw = localStorage.getItem("afripoks.seat");

        if (raw) {
          setSeat(JSON.parse(raw));
        } else {
          setSeat(null);
        }
      } catch {
        setSeat(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const remainingTime = (joinedAt) => {
    const LOCK = 45 * 60 * 1000;
    const remaining = Math.max(
      0,
      joinedAt + LOCK - Date.now()
    );

    const total = Math.ceil(remaining / 1000);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    return minutes > 0
      ? `${minutes} min ${String(seconds).padStart(2, "0")} s`
      : `${seconds} s`;
  };

  const openTable = (table) => {
    if (seat && seat.name === table.name) {
      window.location.href =
        `/table?nom=${encodeURIComponent(table.name)}&play=1`;

      return;
    }

    if (seat && seat.name !== table.name) {
      setSelectedTable({
        ...table,
        blocked: true,
      });

      return;
    }

    setSelectedTable(table);
    setCave(table.cave);
  };

  const closeCave = () => {
    setSelectedTable(null);
    setCave("");
  };

const userId=sessionStorage.getItem('userId');
  const confirmCave = () => {
    if (!selectedTable) return;

    if (selectedTable.blocked) return;

    const amount = Number(cave);
    if (
      !Number.isFinite(amount) ||
      amount < selectedTable.buy
    ) {
      toast.error("Montant insuffisant pour s'asseoir à cette table");
      return;
    }

    // Save cave amount for the session/table if needed (optional based on your requirement)
    sessionStorage.setItem(`player_stack_${selectedTable.id}_${sessionStorage.getItem('userId')}`, amount);
  
    // Redirect to /game/{id}
    window.location.href = `/game/${selectedTable.id}`;
  };

  const goToTable = () => {
    if (!selectedTable && !seat) return;

    const tableName =
      selectedTable?.name || seat?.name || "";

    const currentSeat =
      seat?.name === tableName ? seat : null;

    const caveValue = currentSeat?.buy || "";

    window.location.href =
      `/table?nom=${encodeURIComponent(
        tableName
      )}&play=1${caveValue ? `&cave=${caveValue}` : ""}`;
  };

  const logout = async () => {
    localStorage.removeItem("afripoks.user");

    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // logout local déjà effectué
    }

    setUser(null);
    setMenuOpen(false);

    window.location.href = "/";
  };
 const userIdAvatar = `avatar_${userId}`;
  const displayName = getUserName(user) || "Joueur";
 const [selectedAvatar, setSelectedAvatar] = useState(sessionStorage.getItem(userIdAvatar));
  return (
    <div className="accueil">
      <header>
        <div className="wrap bar">
          <a className="brand" href="/acceuil" onClick={(e) => { e.preventDefault(); window.location.href = '/acceuil'; }}>
            <span className="logo">
              <span className="orbit">
                <i />
                <i />
                <i />
                <i />
              </span>

              <span className="disc">
                <img src="/logo.ico" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </span>
            </span>

            <b>Afripoks</b>
          </a>

          <div className="actions">
            <a className="btn btn-out" href="/depot">
              Dépôt
            </a>

            <a className="btn btn-out" href="/retrait">
              Retrait
            </a>

            {user && (
              <>
                <span className="solde-btn">
                  Votre solde :{" "}
                  {balance.toLocaleString("fr-FR")} Ar
                </span>

                <div
                  className={`who ${
                    menuOpen ? "open" : ""
                  }`}
                >
                  <button
                    className="who-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen((value) => !value);
                    }}
                  >
                    
                    {user.avatar_url ? (
                      <img
                        src={getFullAvatarUrl(user.avatar_url)} 
                        alt=""
                      />
                    ) : (
                      <span className="letter">
                        {displayName
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}

                    <span>{displayName}</span>
                  </button>

                  <div className="who-menu">
                    <a href="/profile">
                      Mon compte
                    </a>

                    <button
                      type="button"
                      onClick={logout}
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </>
            )}

            {!user && (
              <>
                <a
                  className="btn btn-out"
                  href="/login"
                >
                  Connexion
                </a>

                <a
                  className="btn btn-gold"
                  href="/register"
                >
                  S'inscrire
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="rotate-banner">
        Vous jouez sur téléphone ? Tournez l'écran à
        l'horizontale et mettez en plein écran pour
        profiter pleinement de l'expérience.
      </div>

      <main className="wrap">
        {lastTable && (
            <div className="rejoin-banner" style={{ marginBottom: '20px' }}>
                <div className="rejoin-banner-left">

                     Tu t’es levé, mais tu restes à{" "}
                          
                    <div className="rejoin-table-name">
                      {lastTable.name}
                      
                      </div>
                      Tes blindes tournent
                       encore
                    <div className="rejoin-meta">
                        <span><Users size={13} /> {sitCounts.get(String(lastTable.id)) || 0} joueurs</span>
                        <span>SB {(lastTable?.smallBlind ?? 0).toLocaleString()} / BB {(lastTable?.bigBlind ?? 0).toLocaleString()} Ar</span>
                        <span><Wallet size={13} /> {(lastTable?.cave ?? 0).toLocaleString()} Ar</span>
                    </div>
                </div>
                <div className="rejoin-banner-right">
                    <button
                        className="rejoin-main-btn"
                        onClick={() => openTable(lastTable)}
                    >
                        <RotateCcw size={15} />
                        Rejoindre
                    </button>
                </div>
            </div>
        )}
        {/* {seat && (
          <div className="seated">
            Tu t’es levé, mais tu restes à{" "}
            <b>{seat.name}</b>. Tes blindes tournent
            encore.
            <br />

            <small>
              Quitter possible dans{" "}
              {remainingTime(seat.joinedAt)}
            </small>

            <br />

            <a
              href={`/game/${seat.tableId}`}
            >
              Reprendre la table
            </a>
          </div>
        )} */}

        <div className="tools">
          <input
            type="search"
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Rechercher une table…"
          />

          <div className="filters">
            {[
              ["all", "Tous"],
              ["holdem", "Hold'em"],
              ["omaha", "Omaha"],
              ["tournoi", "Tournois"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  filter === value ? "on" : ""
                }
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid">
          {filteredTables.length ? (
            filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                sitCount={sitCounts.get(String(table.id))}
                onEnter={openTable}
              />
            ))
          ) : (
            <p className="empty">
              Aucune table ne correspond.
            </p>
          )}
        </div>
      </main>
{selectedTable && (
  <div className="cavebox">
    <div className="cardx">
      <p className="eyebrow">
        S'asseoir
      </p>

      <h3>{selectedTable.name}</h3>

      <p className="cave-min">
        Cave minimum{" "}
        {selectedTable.cave?.toLocaleString("fr-MG") || 0} Ar · 
        Blindes{" "}
        {selectedTable.smallBlind ||
          (selectedTable.blinds ? selectedTable.blinds[0] : 0)}{" "}
        /{" "}
        {selectedTable.bigBlind ||
          (selectedTable.blinds ? selectedTable.blinds[1] : 0)}
      </p>

      <label htmlFor="cave-amt">
        Montant de ta cave
      </label>

      <input
        id="cave-amt"
        type="number"
        min={selectedTable.buy || 0}
        step="100"
        value={cave}
        className={
          Number(cave) < (selectedTable.buy || 0) && cave !== ""
            ? "error"
            : ""
        }
        onChange={(e) => setCave(e.target.value)}
      />

      <p className="cave-err">
        {Number(cave) < (selectedTable.buy || 0) && cave !== ""
          ? `Minimum ${
              selectedTable.buy?.toLocaleString("fr-MG") || 0
            } Ar`
          : ""}
      </p>

      <div className="modal-row">
        <button
          type="button"
          className="cancel"
          onClick={closeCave}
        >
          Annuler
        </button>

        <button
          type="button"
          className="confirm"
          onClick={confirmCave}
          disabled={
            cave === "" ||
            Number(cave) < Number(selectedTable.cave)
          }
        >
          S'asseoir
        </button>
      </div>
    </div>
  </div>
)}

      {/* {selectedTable && (
        <div className="cavebox">
          <div className="cardx">
            <p className="eyebrow">
              S'asseoir
            </p>

            <h3>{selectedTable.name}</h3>

            {selectedTable.blocked ? (
              <>
                <p className="cave-min">
                  Tu es encore à{" "}
                  <b>{seat?.name}</b>. Tes blindes
                  tournent.
                </p>

                <p className="cave-err">
                  Quitte d’abord {seat?.name} (45
                  min).
                </p>

                <div className="modal-row">
                  <button
                    type="button"
                    className="cancel"
                    onClick={closeCave}
                  >
                    Fermer
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="cave-min">
                  Cave minimum {selectedTable.cave?.toLocaleString("fr-MG") || 0} Ar · 
                  Blindes {selectedTable.smallBlind || (selectedTable.blinds ? selectedTable.blinds[0] : 0)} / {selectedTable.bigBlind || (selectedTable.blinds ? selectedTable.blinds[1] : 0)}
                </p>

                <label htmlFor="cave-amt">
                  Montant de ta cave
                </label>

                <input
                  id="cave-amt"
                  type="number"
                  min={selectedTable.buy || 0}
                  step="100"
                  value={cave}
                  className={Number(cave) < (selectedTable.buy || 0) && cave !== "" ? "error" : ""}
                  onChange={(e) =>
                    setCave(e.target.value)
                  }
                />

                <p className="cave-err">
                  {Number(cave) < (selectedTable.buy || 0) &&
                    cave !== ""
                    ? `Minimum ${
                        selectedTable.buy?.toLocaleString("fr-MG") || 0
                      } Ar`
                    : ""}
                </p>

                <div className="modal-row">
                  <button
                    type="button"
                    className="cancel"
                    onClick={closeCave}
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    className="confirm"
                    onClick={confirmCave}
                    disabled={
                      cave === "" ||
                      Number(cave) < Number(selectedTable.cave)
                    }
                  >
                    S'asseoir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )} */}


      {enter && (
      <div
        className={`enter ${
          enterOpen ? "open" : ""
        } ${enterShow ? "show" : ""}`}
      >
        <img
          className="room"
          src="/tables/hero-room.jpg"
          alt=""
        />

        <div className="cL" />
        <div className="cR" />

        <div className="copy">
          <p className="enter-name">
            {selectedTable?.name || seat?.name}
          </p>

          <h2>
            {WELCOME[
              selectedTable?.name ||
                seat?.name
            ] || "Bienvenue."}
          </h2>

          <button
            type="button"
            className="go"
            onClick={goToTable}
          >
            Entrer à la table
          </button>
        </div>
      </div>
      )}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </div>
      );
      }
