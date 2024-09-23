import Balance from "../components/Balance";
import Transactions from "../components/Transactions";
import "./styles/main.scss";

function Main() {
  return (
    <main className="main">
      <section className="action-buttons"></section>
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
