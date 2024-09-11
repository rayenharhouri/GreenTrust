import { useNavigate } from "react-router";
import "./HomePage.css";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import {Col} from "antd";

function HomePage() {
    const navigate = useNavigate();

    return (
        <>
        <div className="upload-page">
            {/* Header with button aligned to the right */}
            <header className="header">
                <h1>GreenTrust</h1>
                <Col span={12} style={{ textAlign: "right", paddingRight: "200px" }}>
                    <WalletSelector />
                </Col>
            </header>

            {/* Connect Section */}
            <section className="connect-section">
                <div className="connect-row">
                    {/* Connect as CNMS */}
                    <div className="connect-card">
                        <h3>Connect as CNMS (Certificate Issuer)</h3>
                        <p>
                            If you are a certified authority looking to issue certificates, connect with us to manage and issue certificates securely and efficiently.
                        </p>
                        <button className="connect-button" onClick={() => navigate(`/connect-cnms`)}>Continue as CNMS</button>
                    </div>

                    {/* Divider */}
                    <div className="divider"></div>

                    {/* Connect qs Nexus */}
                    <div className="connect-card">
                        <h3>Connect as Nexus (Certificate Demander)</h3>
                        <p>
                            If you need to request your certificates, connect with as Nexus to access a secure and streamlined certificate management system.
                        </p>
                        <button className="connect-button" onClick={() => navigate(`/upload`)}>Continue as Nexus</button>
                    </div>
                </div>

                {/* Divider */}

                

                {/* About Section */}
                <section className="about-section">
                    <h2>About Us</h2>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et ex non sem rhoncus pellentesque quis non lorem. Mauris ornare feugiat facilisis. Aliquam ornare lectus quis nisl egestas, in consequat nulla finibus. Aliquam facilisis enim ut eros sollicitudin congue. Vivamus vulputate vehicula tempor. Duis fringilla quam ac pulvinar lobortis. Maecenas viverra aliquam lorem, et posuere augue ultricies sed. Ut nec odio ac tortor molestie semper. Nam aliquet viverra orci, non imperdiet orci ultricies at. Donec cursus elit ut est eleifend blandit. Nullam pulvinar lorem sed ante laoreet, vitae tristique ipsum egestas. In hac habitasse platea dictumst. Nullam sed gravida arcu.
                    </p>
                </section>

            </section>
        </div>
        </>
    );
}

export default HomePage;
