import Tracking from "../../component/tracking/Tracking";
import Nav from "../../component/nav/Nav";
import DepotMobileInput from "../../component/depotMobileInput/DepotMobileInput";
import DepotCryptoInput from "../../component/depotCryptoInput/DepotCryptoInput";

import "./Depot.scss";
import { ToastContainer } from "react-toastify";

const Depot = () => {
    return (
        <>
            <ToastContainer />
            <Nav />
           
                        <div className="form-container">
                            <DepotMobileInput />     
                        </div>
                
        </>
        
    );
};

export default Depot;