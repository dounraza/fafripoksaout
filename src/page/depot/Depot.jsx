import { useState, useEffect } from "react";
import Tracking from "../../component/tracking/Tracking";
import Nav from "../../component/nav/Nav";
import DepotMobileInput from "../../component/depotMobileInput/DepotMobileInput";
import DepotCryptoInput from "../../component/depotCryptoInput/DepotCryptoInput";
import { getUserProfile } from "../../page/services/userService";
import { ToastContainer } from "react-toastify";

import "./Depot.scss";

const Depot = () => {
    console.log("Depot component rendered");
    const [isVerified, setIsVerified] = useState(true);

    useEffect(() => {
        const checkVerification = async () => {
            try {
                const response = await getUserProfile();
                setIsVerified(response.user.is_verified);
            } catch (error) {
                console.error("Erreur lors de la vérification du profil :", error);
                setIsVerified(false);
            }
        };

        checkVerification();
    }, []);

    return (
        <>
            <ToastContainer />
           
      
                <DepotMobileInput isVerified={isVerified} />
            
        </>
    );
};

export default Depot;