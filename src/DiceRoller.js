import React, { useState, useEffect } from 'react';
import { ThreeDDice } from 'dddice-js';
import './Dice.css';
import icon_d4 from './assets/game-icons--d4.png';
import icon_d6 from './assets/game-icons--perspective-dice-six.png';
import icon_d8 from './assets/game-icons--dice-eight-faces-eight.png';
import icon_d10 from './assets/game-icons--d10.png';
import icon_d12 from './assets/game-icons--d12.png';
import icon_d20 from './assets/game-icons--dice-twenty-faces-twenty.png';

const diceIcons = {
  d4: icon_d4,
  d6: icon_d6,
  d8: icon_d8,
  d10: icon_d10,
  d12: icon_d12,
  d20: icon_d20
};

const DiceRoller = ({ token, roomSlug }) => {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState('');
  const [activationCode, setActivationCode] = useState(localStorage.getItem('activationCode') || '');
  const [activationSecret, setActivationSecret] = useState(localStorage.getItem('activationSecret') || '');
  const [apiKey, setApiKey] = useState('');
  const [activationStatus, setActivationStatus] = useState(false);
  const [dddice, setDddice] = useState(null);
  const [isHidden, setIsHidden] = useState(false)

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

  const handleDiceClick = (type) => {
    const newFormula = updateFormula(formula, type);
    setFormula(newFormula);
  };

  const updateFormula = (currentFormula, type) => {
    const regex = new RegExp(`(\\d*)${type}`, 'g');
    const match = regex.exec(currentFormula);

    if (match) {
      const count = parseInt(match[1] || '1', 10) + 1;
      return currentFormula.replace(regex, `${count}${type}`);
    }

    return currentFormula ? `${currentFormula} + 1${type}` : `1${type}`;
  };

  const parseFormula = (formula) => {
    const regex = /(\d+)(d\d+)/g;
    let match;
    const diceSettings = [];

    while ((match = regex.exec(formula)) !== null) {
      diceSettings.push({ type: match[2], count: parseInt(match[1], 10) });
    }

    return diceSettings;
  };

  const resultRoll = () => {
    const diceSettings = parseFormula(formula);
    let totalResult = 0;
    let rollResults = [];

    diceSettings.forEach(dice => {
      for (let i = 0; i < dice.count; i++) {
        const roll = Math.floor(Math.random() * parseInt(dice.type.slice(1)) + 1);
        totalResult += roll;
        rollResults.push({ type: dice.type, result: roll });
      }
    });

    setResult(`Итого: ${totalResult}\n${rollResults.map(r => `${r.type}: ${r.result}`).join('\n')}`);
    rollDice(rollResults);
  };

  const rollDice = (rollResults) => {
    if (!apiKey) {
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
      "dice": rollResults.map(dice => ({
        "type": dice.type,
        "theme": "dddice-bees",
        "value": dice.result,
        "is_hidden": isHidden
      })),
      "room": `${roomSlug}`,
    };

    fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
      .then(response => response.json());
  };

  const clearFormula = () => {
    setFormula('');
  };

  const hideRoll = () => {
    setIsHidden(prev => !prev);

    
  }


  return (
    <div className="dice">
      <div className="dice-menu">
        {Object.keys(diceIcons).map((type) => (
          <div key={type} className="dice-setting">
            <img
              src={diceIcons[type]}
              alt={type}
              width="42"
              height="42"
              onClick={() => handleDiceClick(type)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        ))}
        <button className='roll' onClick={resultRoll}>Бросить кубики!</button>
        <button className='clearRoll' onClick={clearFormula}>Очистить формулу</button>
        <button className='hideRoll' onClick={hideRoll}>{!isHidden ? 'Скрыть бросок' : 'Показать бросок'}</button>
        <p className='result'>{result}</p>
        <p className='formula'>Формула: {formula}</p>
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
