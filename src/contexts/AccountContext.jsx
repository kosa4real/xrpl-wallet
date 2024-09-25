import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Client, dropsToXrp, xrpToDrops, Wallet } from "xrpl";
import { ToastManager } from "../components/Toast";

//Create context
const AccountContext = createContext();

//Provide component
export const AccountProvider = ({ children }) => {
  const client = useRef();
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
            // Use tx_json.TransactionType to filter for "Payment" transactions
            if (transaction.tx_json.TransactionType !== "Payment") return false;

            // Filter only for XRP Payments (delivered_amount exists as a string)
            return typeof transaction.meta.delivered_amount === "string";
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
              date: new Date((transaction.tx_json.date + 946684800) * 1000), // Convert to correct date
              transactionResult: transaction.meta.TransactionResult, // It's directly available now
              amount:
                transaction.meta.TransactionResult === "tesSUCCESS"
                  ? dropsToXrp(transaction.meta?.delivered_amount) // delivered_amount is directly available
                  : 0,
            };
          });
        setTransactions(filteredTransactions);
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
    // Open a web socket to listen for transactions
    //This web socket will be created once and reused
    if (!client.current) {
      client.current = new Client(import.meta.env.VITE_XRPL_NETWORK);
    }

    const onTransaction = async (event) => {
      if (event.meta.TransactionResult === "tesSUCCESS") {
        console.log(event)
        if (event.tx_json.Account === selectedWallet.address) {
          //Sent
          ToastManager.addToast(
            `Successfully sent ${dropsToXrp(
              event.meta.delivered_amount
            )} XRP`
          );
        } else if (event.tx_json.Destination === selectedWallet.address) {
          ToastManager.addToast(
            `Successfully received ${dropsToXrp(
              event.transaction.meta.delivered_amount
            )} XRP`
          );
        }
      } else {
        ToastManager.addToast("Failed");
      }
      _getBalance(selectedWallet);
      _getTransactions(selectedWallet);
    };

    const listenToWallet = async () => {
      try {
        if (!client.current.isConnected()) await client.current.connect();
        client.current.on("transaction", onTransaction);

        await client.current.request({
          command: "subscribe",
          accounts: [selectedWallet?.address],
        });
      } catch (error) {
        console.error(error);
      } //We don't close any connection
    };

    selectedWallet && listenToWallet();
    _getBalance(selectedWallet);
    _getTransactions(selectedWallet);

    return () => {
      // Clean-up if there is a previous connection open
      if (client.current.isConnected()) {
        (async () => {
          client.current.removeListener("transaction", onTransaction);
          await client.current.request({
            command: "unsubscribe",
            accounts: [selectedWallet.address],
          });
        })();
      }
    };
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

  const sendXRP = async (amount, destination, destinationTag) => {
    alert("in send xrp");
    if (!selectedWallet) throw new Error("No wallet selected");

    //Get wallet from seed
    const wallet = Wallet.fromSeed(selectedWallet.seed);

    //New ledger connection
    const client = new Client(import.meta.env.VITE_XRPL_NETWORK);
    await client.connect();

    try {
      //Create payment object

      const payment = {
        TransactionType: "Payment",
        Account: wallet.classicAddress,
        Amount: xrpToDrops(amount),
        Destination: destination,
      };
      if (destinationTag) {
        payment.DestinationTag = parseInt(destinationTag);
      }

      //Prepare transaction
      const prepared = await client.autofill(payment);

      //sign the transaction
      const signed = wallet.sign(prepared);

      //Submit the transaction and wait before running into finally block
      await client.submitAndWait(signed.tx_blob);
    } catch (error) {
      console.log(error);
    } finally {
      await client.disconnect();

      //Update the selectedWallet balance and transaction state
      refreshBalance(selectedWallet);
      refreshTransactions(selectedWallet);
    }
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
        sendXRP,
        selectedWallet,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

//Custom hook
export const useAccount = () => useContext(AccountContext);
