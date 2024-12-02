import { useNavigate } from "react-router";
import "./HomePage.css";
import {Col} from "antd";

function HomePage() {
    const navigate = useNavigate();

    return (
        <>
        <div className="upload-page">
            {/* Header with button aligned to the right */}
            <header className="header">
                <h1>Lightency Expedition Automation</h1>
            </header>

            {/* Connect Section */}
            <section className="connect-section">
                <div className="connect-row">
                    {/* Connect qs Nexus */}
                    <div className="connect-card">
                        <h3>Connect as Nexus (Certificate Demander)</h3>
                        <p>
                            If you need to request your certificates, connect with as Nexus to access a secure and streamlined certificate management system.
                        </p>
                        <button className="connect-button" onClick={() => navigate(`/upload`)}>Continue as Nexus Agent</button>
                    </div>
                </div>

                {/* Divider */}

                

                {/* About Section */}
                <section className="about-section">
                    <h2>About Us</h2>
                    <h3>
                    Lightency is a green-tech startup that leverages web3 technologies to the service of energy companies. 
                    </h3>
                </section>

            </section>
        </div>
        </>
    );
}

export default HomePage;
