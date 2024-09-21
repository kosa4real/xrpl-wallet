import { Wallet } from "xrpl";
import { useAccount } from "../contexts/AccountContext";
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import "./styles/generate-account.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faCirclePlus } from "@fortawesome/free-solid-svg-icons";


import ButtonGroup from "react-bootstrap/Button";
import Button from "react-bootstrap/Button";

function GenerateAccount() {
  const navigate = useNavigate();

  const [seed, setSeed] = useState("");
  const [address, setAddress] = useState("");

  const { addAccount } = useAccount();

  const handleGenerateAccount = () => {
    const newWallet = Wallet.generate();
    setSeed(newWallet.seed);
    setAddress(newWallet.classicAddress);
  };

  const handleSaveAccount = () => {
    //create the new account object
    const account = {
      address: address,
      seed: seed,
    };

    //update the application state
    addAccount(account)

    //navigate back to the manage accounts page
    navigate("/manage-account")
  };

  const handleCancel = () => {};
  return (
    <div className="generate-account">
      {seed ? (
        <>
          <h1>
            <FontAwesomeIcon icon={faFloppyDisk} />
            <span>Save Account</span>
          </h1>
          <div className="account-container">
            <label>Address:</label>
            <div>{address}</div>

            <label>Family Seed:</label>
            <div>{seed}</div>
          </div>
          <div className="action-buttons">
            <Button variant="primary" onClick={handleSaveAccount}>
              Save to wallet
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1>
            <FontAwesomeIcon icon={faCirclePlus} />
            <span>Generate Account</span>
          </h1>
          <p>
            Clicking generate will create a new seed and rAddress, but
            your&rsquo;ll need to click save to add it to your acount and its
            won&rsquo;t become active until you sen it some XRP.
          </p>
          <Button variant="primary" onClick={handleGenerateAccount}>Generate</Button>
        </>
      )}
    </div>
  );
}

export default GenerateAccount;
