import React, { useState, useEffect } from 'react';
import { ThreeDDice } from 'dddice-js';
import './Dice.css';

const DiceRoller = () => {
  const [diceType, setDiceType] = useState('d6');
  const [diceCount, setDiceCount] = useState(1);
  const [result, setResult] = useState('');
  const [activationCode, setActivationCode] = useState(localStorage.getItem('activationCode') || '');
  const [activationSecret, setActivationSecret] = useState(localStorage.getItem('activationSecret') || '')
  const [apiKey, setApiKey] = useState('rjzVFjp3TDEJRHmXyoI6gVI0R3EDrYSQkCpCQjJ0c1e2b847');
  const [activationStatus, setActivationStatus] = useState(false);
  const [dddice, setDddice] = useState(null);

  useEffect(() => {
    if (apiKey) {
      const dddiceInstance = new ThreeDDice(document.getElementById("dddice"), apiKey);
      dddiceInstance.start();
      dddiceInstance.connect("mZNB3Bk");
      setDddice(dddiceInstance);
    }
  }, [apiKey]);

  const generateActivationCode = () => {
    const url = new URL("https://dddice.com/api/1.0/activate");
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    fetch(url, {
      method: "POST",
      headers,
    })
    .then(response => {
        if (!response.ok) {
          throw new Error('Failed to generate activation code');
        }
        return response.json();
      })
      .then(data => {
        setActivationCode(data.data.code);
        setActivationSecret(data.data.secret);
        localStorage.setItem('activationCode', data.data.code);
        localStorage.setItem('activationSecret', data.data.secret);
        pollActivationStatus(data.data.code, data.data.secret);
      })
      .catch(error => console.error('Error:', error));
  };
 
  const pollActivationStatus = (code, secret) => {
    const intervalId = setInterval(() => {
      const url = new URL(`https://dddice.com/api/1.0/activate/${code}`);
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Secret ${secret}`,
      };

      fetch(url, {
        method: "GET",
        headers,
      })
        .then(response => response.json())
        .then(data => {
          if (data.data.token) {
            setApiKey(data.data.token);
            setActivationStatus(true);
            clearInterval(intervalId);
            localStorage.removeItem('activationCode');
            localStorage.removeItem('activationSecret');
          }
        })
        .catch(error => console.error('Error:', error));
    }, 5000);
  };

  
  console.log("code: " + activationCode + "\nsecret: " + activationSecret + "\nstatus: " + activationStatus)

  const resultRoll = () => {
    let totalResult = 0;
    for (let i = 0; i < diceCount; i++) {
      const roll = Math.floor(Math.random() * parseInt(diceType.slice(1)) + 1);
      totalResult += roll;
    }
    setResult(totalResult);



    rollDice(totalResult)
  }

  const rollDice = (totalResult) => {
    if (!apiKey) {
      alert('Please activate your account first.');
      return;
    }
    const url = new URL("https://dddice.com/api/1.0/roll");
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    const body = {
      "dice": [
        {
          "type": `${diceType}`,
          "theme": "dddice-bees",
          "value": `${totalResult}`
        }
      ],
      "room": "mZNB3Bk",
    };

    fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
      .then(response => response.json()) 
  };

  return (
    <div className="dice">
      <div className="dice-menu">
        <select value={diceType} onChange={(e) => setDiceType(e.target.value)}>
            <option value="d4">d4</option>
            <option value="d6">d6</option>
            <option value="d8">d8</option>
            <option value="d10">d10</option>
            <option value="d12">d12</option>
            <option value="d20">d20</option>
            <option value="d10x">d100</option>
        </select>
        <input
          type="number"
          value={diceCount}
          onChange={(e) => setDiceCount(e.target.value)}
          min="1"
          max="25"
        />
        <button onClick={resultRoll}>Roll Dice!</button>
        <p>{result}</p>
      </div>
      {!activationStatus && (
        <div className="activation">
          <button onClick={generateActivationCode}>Generate Activation Code</button>
          {activationCode && (
            <div>
              <p>Activation Code: {activationCode}</p>
              <p>Please go to <a href="https://dddice.com/activate" target="_blank" rel="noopener noreferrer">dddice.com/activate</a> and enter the code.</p>
            </div>
          )}
        </div>
      )}
      <canvas id='dddice'></canvas>
    </div>
  );
}

export default DiceRoller;
