import React, { useState, useEffect } from 'react';

const StreamPlayer = () => {
  const [audioUrls, setAudioUrls] = useState([]);

  return (
    <div className="stream-player">
      <iframe width="190" height="120" src="https://demopage.gcdn.co/videos/2675_10hwQ62gN4IRs6Es" frameborder="0" allowfullscreen></iframe>
    </div>
  );
};

export default StreamPlayer;
