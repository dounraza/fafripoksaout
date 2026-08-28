import React, { useState, useEffect, useMemo, useContext } from 'react';
import './acceuil.scss';
import { FaHome, FaGamepad, FaTrophy, FaPlay, FaSignInAlt } from 'react-icons/fa';
import { getAll } from '../../services/tableServices';
import { useNavigate } from "react-router-dom";
import { Users, Wallet, RotateCcw } from "lucide-react";
import Nav from "../../component/nav/Nav";
import { JoinedTableContext } from '../../contexts/JoinedTableContext';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import tableImg1 from '../../styles/image/table/1.jpg';
import tableImg2 from '../../styles/image/table/2.jpg';
import tableImg3 from '../../styles/image/table/3.jpg';
import tableImg4 from '../../styles/image/table/4.jpg';
import tableImg5 from '../../styles/image/table/5.jpg';
import tableImg6 from '../../styles/image/table/6.png';

const Acceuil = () => {
    const { joinedTables } = useContext(JoinedTableContext);
    const [activeTab, setActiveTab] = useState('cash'); 
    const [gameFilter, setGameFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [tables, setTables] = useState([]);
    const [sitCounts, setSitCounts] = useState(new Map());
    const [showModalCave, setShowModalCave] = useState(false);
    const [selectedTableId, setSelectedTableId] = useState(null);
    const [cave, setCave] = useState("");
    const [solde, setSolde] = useState(0);
    const navigate = useNavigate();
    
    const [lastTableId, setLastTableId] = useState(() => {
        const saved = sessionStorage.getItem('lastTableId');
        return saved ? Number(saved) : null;
    });

    const userId = sessionStorage.getItem('userId');

    const isTableJoined = (tableId) => {
        const joined = joinedTables.includes(parseInt(tableId));
        return joined;
    };

    const tableImages = useMemo(() => [
        tableImg1, tableImg2, tableImg3, tableImg4, tableImg5, tableImg6
    ], []);

    useEffect(() => {
        console.log("Fetching tables...");
        getAll(setTables, setSitCounts);
        if (userId) {
            import('../../services/soldeService').then(module => {
                module.getSolde(userId, setSolde);
            });
        }
    }, [userId]);

    useEffect(() => {
        console.log("Tables state updated:", tables);
    }, [tables]);

    const handleJoinClick = (tableId) => {
        setSelectedTableId(tableId);
        
        // Initialiser la cave avec la dernière valeur enregistrée en session
        const userId = sessionStorage.getItem('userId');
        const key = `player_stack_${tableId}_${userId}`;
        const lastStack = sessionStorage.getItem(key);
        
        if (lastStack) {
            setCave(lastStack);
        } else {
            setCave(""); 
        }
        
        setShowModalCave(true);
    };

    const verifyCave = async (id) => {
        const table = tables.find(t => t.id === id);
        const caveMin = table?.cave || 0;

        if (cave === '') {
            goToTable(selectedTableId, caveMin);
        } else if (Number(cave) >= Number(caveMin)) {
            if (solde >= Number(cave)) {
                goToTable(selectedTableId, cave);
            } else {
                toast.error("Votre solde est insuffisant !");
                return;
            }
        }
         

        setShowModalCave(false);
        setSelectedTableId(null);
        setCave('');
    };

    const playGame = () => verifyCave(selectedTableId);

    const lastTable = lastTableId
        ? tables.find(t => Number(t.id) === Number(lastTableId))
        : null;

    const filteredTables = useMemo(() => {
        if (!tables || !Array.isArray(tables)) return [];
        return tables.filter(t => {
            const matchesGame = gameFilter === 'all' || t.gameType === gameFilter;
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesGame && matchesSearch;
        });
    }, [tables, gameFilter, searchTerm]);

    const goToTable = (tableId, caveValue, isRejoin = false) => {
        sessionStorage.setItem('lastTableId', String(tableId));
        setLastTableId(tableId);
        navigate(`/game/${tableId}`, { state: { cave: caveValue, isRejoin } });
    };

    const renderContent = () => {
        if (activeTab === 'home') {
            return (
                <div className="welcome-section">
                    <div className="hero-banner">
                        <h1>L'expérience Poker <span className="gold-text">Premium</span></h1>
                        <p>Plongez dans l'univers du poker haut de gamme. Tables exclusives, tournois prestigieux et ambiance casino garantie.</p>
                        <button className="cta-button" onClick={() => setActiveTab('cash')}>Commencer à jouer</button>
                    </div>
                    <div className="features-grid">
                        <div className="feature-item">
                            <FaGamepad className="icon" />
                            <h3>Cash Games</h3>
                            <p>Des tables Hold'em et Omaha disponibles 24h/24 pour tous les niveaux.</p>
                        </div>
                        <div className="feature-item">
                            <FaTrophy className="icon" />
                            <h3>Tournois</h3>
                            <p>Participez à nos événements hebdomadaires et remportez des prix incroyables.</p>
                        </div>
                        <div className="feature-item">
                            <Users className="icon" />
                            <h3>Communauté</h3>
                            <p>Rejoignez des milliers de joueurs passionnés à travers toute l'Afrique.</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'tournaments') {
            return (
                <div className="coming-soon">
                    <FaTrophy size={80} className="gold-text" />
                    <h2>Tournois à venir</h2>
                    <p>Nous préparons des événements exceptionnels pour vous. Restez connectés !</p>
                </div>
            );
        }

        return (
            <div className="cash-section">
                {lastTable && (
                    <div className="section-container rejoin-section">
                        <div className="section-header">
                            <h3 className="section-title">
                                <RotateCcw size={16} />
                                &nbsp;Reprendre la partie
                            </h3>
                        </div>

                        <div className="rejoin-banner">
                            <div className="rejoin-banner-left">
                                <div className="rejoin-table-name">{lastTable.name}</div>
                                <div className="rejoin-meta">
                                    <span><Users size={13} /> {sitCounts.get(String(lastTable.id)) || 0} joueurs</span>
                                    <span>SB {(lastTable?.smallBlind ?? 0).toLocaleString()} / BB {(lastTable?.bigBlind ?? 0).toLocaleString()} Ar</span>
                                    <span><Wallet size={13} /> {(lastTable?.cave ?? 0).toLocaleString()} Ar</span>
                                </div>
                            </div>
                            <div className="rejoin-banner-right">
                                <button
                                    className="rejoin-main-btn"
                                    onClick={() => {
                                        setSelectedTableId(lastTable.id);
                                        setShowModalCave(true);
                                    }}
                                >
                                    <RotateCcw size={15} />
                                    Rejoindre
                                </button>
                                
                            </div>
                        </div>
                    </div>
                )}

                <div className="filter-controls">
                    <input 
                        type="text" 
                        placeholder="Rechercher une table..." 
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="filter-nav">
                        {['all', 'holdem', 'omaha'].map(type => (
                            <button 
                                key={type} 
                                className={`tab-item ${gameFilter === type ? 'active' : ''}`} 
                                onClick={() => setGameFilter(type)}
                            >
                                {type.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="lobby-grid">
                 {[...filteredTables]
                    .sort((a, b) => {
                        if (a.gameType === b.gameType) return 0;
                        return a.gameType === "omaha" ? -1 : 1;
                    })
                    .map((table) => {
                        const joined = isTableJoined(table.id);
                        return (
                        <div key={table.id} 
                             className="lobby-card" 
                             style={{ backgroundImage: `url(${tableImages[table.id % tableImages.length]})` }}>
                            
                            <h4 className="lobby-card-title"><i>{table.name}</i></h4>
                            
                            <div className="play-button-container" onClick={() => {
                                if (joined) {
                                    goToTable(table.id, null, true);
                                } else {
                                    handleJoinClick(table.id);
                                }
                            }}>
                                {joined ? (
                                    <button className="lobby-play-btn-circle" title="Rejoindre">
                                        <FaSignInAlt color="black" size={18} />
                                    </button>
                                ) : (
                                    <button className="lobby-play-btn-circle" title="Jouer">
                                        <FaPlay color="black" size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="lobby-card-info-bottom">
                                <div className="info-row">
                                    <span className="game-type-badge">{table.gameType === 'holdem' ? "Texas Hold'em" : "Omaha"}</span>
                                    <span className="player-count"><Users size={14}/> {sitCounts.get(String(table?.id)) || 0}/9</span>
                                </div>
                                <div className="info-row main-stats">
                                    <div className="stat"><span>Cave</span> <b>{(table?.cave ?? 0).toLocaleString()} Ar</b></div>
                                    <div className="stat"><span>Blinds</span> <b>{(table?.smallBlind ?? 0).toLocaleString()} / {(table?.bigBlind ?? 0).toLocaleString()}</b></div>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        );
    };

    return (
        <div className='dashboard-container'>
            <ToastContainer />
            <Nav />

            <nav className="tabs-nav" style={{ marginTop: '80px' }}>
                <button className={`tab-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}><FaHome /> Home</button>
                <button className={`tab-item ${activeTab === 'cash' ? 'active' : ''}`} onClick={() => setActiveTab('cash')}><FaGamepad /> Cash Games</button>
                <button className={`tab-item ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>
                    <FaTrophy /> Tournaments
                    <span className="new-badge">NEW</span>
                </button>
            </nav>

            <main className="main-content">
                {renderContent()}
            </main>

            {/* Modal Cave */}
            {showModalCave && renderCaveModal()}
        </div>
    );

    // Fonction de rendu du modal (définie à l'intérieur de Acceuil)
    function renderCaveModal() {
        const selectedTable = tables.find(t => t.id === selectedTableId);
        const minCave = selectedTable?.cave || 0;
        const maxCave = solde;
        const currentCaveValue = cave === "" ? minCave : parseInt(cave);
        const seatId = sessionStorage.getItem("seat_" + userId);
        const key = `players_stacks_${selectedTable.id}_${seatId}_${userId}`;
        const playerStack = parseInt(sessionStorage.getItem(key)) || 0;
        
        let isButtonDisabled = "";
        let isInputDisabled = false;
        let displayCave = cave;

        if (playerStack > 0) {
            displayCave = playerStack;
            isButtonDisabled = "";
            isInputDisabled = true;
        } else {
            displayCave = cave;
            if (currentCaveValue < minCave || currentCaveValue > solde || solde <= 0) {
                isButtonDisabled = "disabled";
            }
            isInputDisabled = false;
        }
       
        return (
            <div className="modal-overlay" onClick={() => setShowModalCave(false)}>
                <div className="modal-card cave-modal-premium" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-glow"></div>
                    <div className="modal-header">
                        <div className="table-icon">♠</div>
                        <h3>Rejoindre  {selectedTable?.name}</h3>
                        <div className="header-divider"></div>
                    </div>
                    
                    <div className="modal-body">
                        <div className="cave-display">
                            <span className="label">VOTRE CAVE </span>
                            
                            <div className="amount-wrapper">
                                <input
                                    type="number"
                                    value={displayCave}
                                    onChange={(e) => setCave(e.target.value)}
                                    className="cave-input-premium"
                                    autoFocus
                                    disabled={isInputDisabled}
                                    placeholder={minCave.toString()}
                                />
                                <span className="currency">Ar</span>
                            </div>
                        </div>

                        <div className="slider-container">
                            <input 
                                type="range" 
                                min={minCave} 
                                max={Math.max(minCave, maxCave)} 
                                value={currentCaveValue}
                                onChange={(e) => setCave(e.target.value)}
                                className="cave-slider"
                                disabled={isInputDisabled}
                            />
                            <div className="slider-labels">
                                <span>Min: {minCave.toLocaleString()}</span>
                                <span>Max: {maxCave.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button className="modal-btn cancel" onClick={() => setShowModalCave(false)}>
                            ANNULER
                        </button>
                        <button 
                            className="modal-btn confirm-premium" 
                            onClick={playGame}
                            disabled={isButtonDisabled}
                        >
                            C'EST PARTI !
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Acceuil;