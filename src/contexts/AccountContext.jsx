import { createContext, useContext, useState } from "react";

//Create context
const AccountContext = createContext();

//Provide component
export const AccountProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);

  const addAccount = (account) => {
    // setAccounts((prevAccounts) => [...prevAccounts, account]);
    setAccounts((prevAccounts) => {
      const updatedAccount = [...prevAccounts, account];
      localStorage.setItem("accounts", JSON.stringify(updatedAccount));
      return updatedAccount
    });
  };

  return (
    <AccountContext.Provider value={{ accounts, addAccount }}>
      {children}
    </AccountContext.Provider>
  );
};

//Custom hook
export const useAccount = () => useContext(AccountContext);
