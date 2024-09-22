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
  const [balance, setBalance] = useState();
  const [reserve, setReserve] = useState();

  const _getBalance = useCallback(async (account) => {
    if (account) {
      console.log("ACCOUNT TO CHECK BALALNCE", account);
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
        console.log(response);

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
        console.log(response);
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
  }, [selectedWallet, _getBalance]);

  const refreshBalance = () => {
    _getBalance(selectedWallet);
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
