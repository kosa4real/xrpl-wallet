import "./styles/transactions.scss";
import Transaction from "./Transaction";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";

import { useAccount } from "../contexts/AccountContext";

function Transactions() {
  const { transactions, refreshTransactions } = useAccount();

  const handleTransactionsRefresh = () => {
    refreshTransactions();
  };
  return (
    <div className="transactions">
      <label>
        Transactions
        <FontAwesomeIcon icon={faRefresh} onClick={handleTransactionsRefresh} />
      </label>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.hash}>
            <Transaction transaction={transaction} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Transactions;
