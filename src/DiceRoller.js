import React, { useState, useEffect } from 'react';
import { ThreeDDice } from 'dddice-js';
import './Dice.css';
import icon_d4 from './assets/game-icons--d4.png'
import icon_d6 from './assets/game-icons--perspective-dice-six.png'
import icon_d8 from './assets/game-icons--dice-eight-faces-eight.png'
import icon_d10 from './assets/game-icons--d10.png'
import icon_d12 from './assets/game-icons--d12.png'
import icon_d20 from './assets/game-icons--dice-twenty-faces-twenty.png'


const DiceRoller = ({ token, roomSlug }) => {
  const [diceType, setDiceType] = useState('d6');
  const [diceCount, setDiceCount] = useState(1);
  const [result, setResult] = useState('');
  const [activationCode, setActivationCode] = useState(localStorage.getItem('activationCode') || '');
  const [activationSecret, setActivationSecret] = useState(localStorage.getItem('activationSecret') || '')
  const [apiKey, setApiKey] = useState('');
  const [activationStatus, setActivationStatus] = useState(false);
  const [dddice, setDddice] = useState(null);

  useEffect(() => {
    if (token && roomSlug && token !== '[object Object]' && roomSlug !== '[object Object]') {
      const dddiceInstance = new ThreeDDice(document.getElementById("dddice"), token);
      dddiceInstance.start();
      dddiceInstance.connect(roomSlug);
      setDddice(dddiceInstance);
    }
  }, [token, roomSlug]);

  const generateActivationCode = () => {
    if (token !== '[object Object]' && roomSlug !== '[object Object]') {
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
    }
  };
 
  const pollActivationStatus = (code, secret) => {
    if (token !== '[object Object]' && roomSlug !== '[object Object]') {
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
    }
  };

  console.log("code: " + activationCode + "\nsecret: " + activationSecret + 
              "\nstatus: " + activationStatus + "\napiToken: " + apiKey + "\nroomSlug: " + roomSlug);

  const resultRoll = () => {
    let totalResult = 0;
    for (let i = 0; i < diceCount; i++) {
      const roll = Math.floor(Math.random() * parseInt(diceType.slice(1)) + 1);
      totalResult += roll;
    }
    setResult(totalResult);
    rollDice(totalResult);
  };

  const rollDice = (totalResult) => {
    if (!token) {
      alert('Пожалуйста, сгенерируйте код активации и после выполните показанную инструкцию для броска кубиков');
      return;
    }
    const url = new URL("https://dddice.com/api/1.0/roll");
    const headers = {
      "Authorization": `Bearer ${token}`,
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
      "room": `${roomSlug}`,
    };

    fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
      .then(response => response.json());
  };

/* WS connect, send result all users*/

  return (
    <div className="dice">
      
      <div className="dice-menu">
        <div className='diceBar' value={diceType}>
          <button value='d4' onClick={(e) => setDiceType('d4')}>
            <img src={icon_d4} alt='Custom Icon' width="42" height="42"></img>
          </button>

          <button value='d6' onClick={(e) => setDiceType('d6')}>
            <img src={icon_d6} alt='Custom Icon' width="42" height="42"></img>
          </button>

          <button value='d8' onClick={(e) => setDiceType('d8')}>
            <img src={icon_d8} alt='Custom Icon' width="42" height="42"></img>
          </button>

          <button value='d10' onClick={(e) => setDiceType('d10')}>
            <img src={icon_d10} alt='Custom Icon' width="42" height="42"></img>
          </button>

          <button value='d12' onClick={(e) => setDiceType('d12')}>
            <img src={icon_d12} alt='Custom Icon' width="42" height="42"></img>
          </button>

          <button value='d20' onClick={(e) => setDiceType('d20')}>
            <img src={icon_d20} alt='Custom Icon' width="42" height="42"></img>
          </button>

          <button value='d10x' onClick={(e) => setDiceType('d100')}>
            <img src={icon_d10} alt='Custom Icon' width="42" height="42"></img>
          </button>

        </div>
        <input
          className='rollInput'
          type="number"
          value={diceCount}
          onChange={(e) => setDiceCount(e.target.value)}
          min="1"
          max="25"
        />
        <button className='rollbutton' onClick={resultRoll}>Roll Dice!</button>
        <p>{result}</p>
      </div>
      {!activationStatus && (
        <div className="activation">
          <button onClick={generateActivationCode}>Сгенерировать активационный код</button>
          {activationCode && (
            <div>
              <p>Активацонный код: {activationCode}</p>
              <p>Пожалуйста перейдите по ссылке <a href="https://dddice.com/activate" target="_blank" rel="noopener noreferrer">dddice.com/activate</a> и введите код</p>
            </div>
          )}
        </div>
      )}
      <canvas id='dddice'></canvas>
    </div>
  );
}

export default DiceRoller;


