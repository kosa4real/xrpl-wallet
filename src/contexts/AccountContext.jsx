import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Client, dropsToXrp, xrpToDrops } from "xrpl";

//Create context
const AccountContext = createContext();

//Provide component
export const AccountProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState();
  const [reserve, setReserve] = useState();

  const _getBalance = useCallback(async (account) => {
    if (account) {
      //Create a connection to the ledger
      const client = new Client(import.meta.env.VITE_XRPL_NETWORK);
      await client.connect();

      //Get the account balance from the latest ledger account info
      try {
        const response = await client.request({
          command: "account_info",
          account: account.address,
          ledger_index: "validated", //specify a ledger index OR a shortcut like validated, current or closed.
        });

        //Convert the balance returned in drops to XRP
        setBalance(dropsToXrp(response.result.account_data.Balance));
      } catch (error) {
        console.log(error);
        setBalance(); //Set balance to undefined - account doesn't exist
      } finally {
        client.disconnect();
      }
    }
  }, []);
const _getTransactions = useCallback(async (account) => {
  if (account) {
    const client = new Client(import.meta.env.VITE_XRPL_NETWORK);

    // Await the connection to ensure it's ready before making requests
    await client.connect();

    try {
      const allTransactions = await client.request({
        command: "account_tx",
        account: account.address,
        ledger_index_min: -1,
        ledger_index_max: -1,
        limit: 20,
        forward: false,
      });

      // Filter the transactions - we only care about payments in XRP
      const filteredTransactions = allTransactions.result.transactions
        .filter((transaction) => {
          console.log("SINGLE TRANSACTION", transaction)
          // Use tx_json.TransactionType to filter for "Payment" transactions
          if (transaction.tx_json.TransactionType !== "Payment") return false;

          // Filter only for XRP Payments (delivered_amount exists as a string)
          return typeof transaction.delivered_amount === "string";
        })
        .map((transaction) => {
          return {
            account: transaction.tx_json.Account,
            destination: transaction.tx_json.Destination,
            hash: transaction.hash,
            direction:
              transaction.tx_json.Account === account.address
                ? "Sent"
                : "Received",
            date: new Date((transaction.date + 946684800) * 1000), // Convert to correct date
            transactionResult: transaction.TransactionResult, // It's directly available now
            amount:
              transaction.TransactionResult === "tesSUCCESS"
                ? dropsToXrp(transaction.delivered_amount) // delivered_amount is directly available
                : 0,
          };
        });
      console.log(filteredTransactions)
      setTransactions(filteredTransactions);
      console.log("FILTERED", filteredTransactions);
    } catch (error) {
      console.error(error);
      setTransactions([]);
    } finally {
      await client.disconnect();
    }
  }
}, []);


  useEffect(() => {
    const storedAccounts = localStorage.getItem("accounts");
    const storedDefault = localStorage.getItem("selectedAccount");
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts));
    }
    if (storedDefault) {
      setSelectedWallet(JSON.parse(storedDefault));
    }

    const _getCurrentReserve = async () => {
      //Create a connection to the ledger
      const client = new Client(import.meta.env.VITE_XRPL_NETWORK);
      await client.connect();

      //Get the account balance from the latest ledger account info
      try {
        const response = await client.request({
          command: "server_info",
        });
        const reserve = response.result.info.validated_ledger.reserve_base_xrp;
        setReserve(reserve);
      } catch (error) {
        console.log(error);
      } finally {
        client.disconnect();
      }
    };

    _getCurrentReserve();
  }, []);

  useEffect(() => {
    _getBalance(selectedWallet);
    _getTransactions(selectedWallet);
  }, [selectedWallet, _getBalance, _getTransactions]);

  const refreshBalance = () => {
    _getBalance(selectedWallet);
  };

  const refreshTransactions = () => {
    _getTransactions(selectedWallet);
  };

  const selectWallet = (account) => {
    localStorage.setItem("selectedAccount", JSON.stringify(account));
    setSelectedWallet(account);
  };

  const addAccount = (account) => {
    setAccounts((prevAccounts) => {
      if (prevAccounts.includes(account)) {
        //TODO: Update to use notification system
        console.log("Account duplication: not added");
        return;
      } else {
        const updatedAccount = [...prevAccounts, account];
        localStorage.setItem("accounts", JSON.stringify(updatedAccount));
        return updatedAccount;
      }
    });
  };

  const removeAccount = (account) => {
    setAccounts((prevAccounts) => {
      const updateAccounts = prevAccounts.filter((a) => a !== account);
      localStorage.setItem("accounts", JSON.stringify(updateAccounts));
      return updateAccounts;
    });
  };

  return (
    <AccountContext.Provider
      value={{
        accounts,
        addAccount,
        balance,
        reserve,
        transactions,
        refreshTransactions,
        removeAccount,
        selectWallet,
        refreshBalance,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

//Custom hook
export const useAccount = () => useContext(AccountContext);
