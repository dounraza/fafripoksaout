import { useState, useEffect } from "react";
import Tracking from "../../component/tracking/Tracking";
import Nav from "../../component/nav/Nav";
import RetraitMobileInput from "../../component/retraitMobileInput/RetraitMobileInput";
import RetraitCryptoInput from "../../component/retraitCryptoInput/RetraitCryptoInput";
import { getUserProfile } from "../../page/services/userService";

import "./Retrait.scss";
import { ToastContainer } from "react-toastify";

const Retrait = () => {
    const [isVerified, setIsVerified] = useState(false);

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
          
            
                        <div className="form-container">
                            <RetraitMobileInput isVerified={isVerified} />     
                        </div>
                        
        </>
        
    );
};

export default Retrait;