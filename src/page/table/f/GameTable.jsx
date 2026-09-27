import { useEffect, useState, useContext } from "react";
import Nav from "../../component/nav/Nav";
import Game from "../../component/game/Game";
import LudoGame from "../../component/game/LudoGame"; // Import LudoGame
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { getTableDetails } from "../../services/tableServices"; // Import getTableDetails instead of getById
import { getSolde } from "../../services/soldeService";
import { JoinedTableContext } from "../../contexts/JoinedTableContext";

import "./GameTable.scss";

const GameTable = () => {
    const { tableid } = useParams();
    const { tableSessionIdShared } = useParams();
    const [tableSessionId, setTableSessionId] = useState();
    const navigate = useNavigate();
    const { joinedTables } = useContext(JoinedTableContext);

    const [cavePlayer, setCavePlayer] = useState(null);
    const [gameType, setGameType] = useState(null); // Add gameType state
    const routeLocation = useLocation();

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        
        // Persist lastTableId for this user
        if (userId) {
            localStorage.setItem(`lastTableId_${userId}`, String(tableid));
        }
        sessionStorage.setItem('lastTableId', String(tableid));

        const initGame = async () => {
            const isRejoin = routeLocation.state?.isRejoin || joinedTables.includes(parseInt(tableid));

            // 1. Charger la table pour avoir le gameType et la cave
            let tableData = null;
            try {
                tableData = await getTableDetails(tableid);
                console.log("DEBUG: tableData from backend raw:", tableData);
                // Directly check all possible fields for gameType
                const type = tableData?.gameType || tableData?.activeGameType || 'poker';
                setGameType(type);
                // alert("Game Type detected: " + type + "\nRaw Data: " + JSON.stringify(tableData)); 
            } catch (e) {
                console.error("Erreur récupération table:", e);
                toast.error("Impossible de déterminer le type de jeu. Veuillez réessayer.");
                navigate('/acceuil');
                return;
            }

            // 2. Vérifier le solde (seulement si ce n'est pas un rejoin)
            if (userId && userId !== "null" && userId !== "undefined" && !isRejoin) {
                try {
                    let currentSolde = 0;
                    await getSolde(userId, (val) => currentSolde = val);
                    if (Number(currentSolde) <= 0) {
                        toast.error("Solde insuffisant pour jouer !");
                        navigate('/acceuil');
                        return;
                    }
                } catch (error) {
                    console.error("Erreur lors de l'initialisation du jeu (solde):", error);
                    toast.error("Erreur lors de la récupération de votre solde. Veuillez vous reconnecter.");
                    navigate('/acceuil');
                    return;
                }
            } else if (!isRejoin && (!userId || userId === "null" || userId === "undefined")) {
                toast.error("Utilisateur non identifié. Veuillez vous reconnecter.");
                navigate('/acceuil');
                return;
            }
            // 3. Charger la cave
            const cave = Number(routeLocation.state?.cave) || Number(tableData.cave) || Number(tableData.buy) || 0;
            
            if (cave >= 0) {
                setCavePlayer(cave);
            } else {
                toast.error("Impossible de déterminer la cave. Veuillez réessayer.");
                navigate('/acceuil');
            }
        };
        initGame();
    }, [routeLocation, tableid, navigate, joinedTables]);

    return (
        <>
            <ToastContainer />
            <div className="table-container" style={{ position: 'relative', minHeight: '100vh', backgroundImage: 'url("/table-bg.jpg")' }}> 
                <img src="/table-bg.jpg" alt="..." style={{ width: '100%', height: '100vh', objectFit: 'cover', position: 'absolute' }} />
                
                <div className="game-content" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
                    {cavePlayer !== null && gameType && (
                        gameType === 'ludo' ? (
                            <LudoGame
                                key={tableid}
                                tableId={tableid}
                            />
                        ) : (
                            <Game
                                key={tableid}
                                tableId={tableid}
                                tableSessionIdShared={tableSessionIdShared}
                                setTableSessionId={setTableSessionId}
                                cavePlayer={cavePlayer}
                            />
                        )
                    )}
                </div>
            </div>
        </>
    );
};

export default GameTable;