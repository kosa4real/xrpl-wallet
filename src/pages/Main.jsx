import Balance from "../components/Balance";
import Transactions from "../components/Transactions";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTurnUp } from "@fortawesome/free-solid-svg-icons";
import "./styles/main.scss";

function Main() {
  return (
    <main className="main">
      <section className="action-buttons">
        <Link to="/send">
          <Button variant="primary">
            <FontAwesomeIcon icon={faArrowTurnUp} />
            Send
          </Button>
        </Link>
      </section>
      <section className="balance-container">
        <Balance />
      </section>
      <section className="transactions-container">
        <Transactions />
      </section>
    </main>
  );
}
export default Main;
