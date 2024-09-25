import { useState } from "react";
import Balance from "../components/Balance";
import Transactions from "../components/Transactions";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTurnDown,
  faArrowTurnUp,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";

import { useAccount } from "../contexts/AccountContext";

import "./styles/main.scss";

function Main() {
  const [showReceiveXRP, setShowReceiveXRP] = useState(false);
  const { selectedWallet } = useAccount();
  const handleRequestXRP = () => {
    setShowReceiveXRP(true);
  };

  const handleHideReceiveXRP = () => {
    setShowReceiveXRP(false);
  };
  return (
    <>
      <main className="main">
        <section className="action-buttons">
          <Link to="/send">
            <Button variant="primary">
              <FontAwesomeIcon icon={faArrowTurnUp} />
              Send
            </Button>
          </Link>
          <Button variant="primary" onClick={handleRequestXRP}>
            <FontAwesomeIcon icon={faArrowTurnDown} />
            <span>Receive</span>
          </Button>
        </section>
        <section className="balance-container">
          <Balance />
        </section>
        <section className="transactions-container">
          <Transactions />
        </section>
      </main>
      <Modal show={showReceiveXRP} onHide={handleHideReceiveXRP}>
        <Modal.Header closeButton>

        <Modal.Title>Receive XRP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Give the sender this address</strong>
          </p>
          <p>{selectedWallet?.address}</p>
        </Modal.Body>
      </Modal>
    </>
  );
}
export default Main;
