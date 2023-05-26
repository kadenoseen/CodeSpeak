import React, { useEffect, useState } from 'react';

interface TokenUsageProps {
  code: string;
  mode: number;
}

const TokenUsage: React.FC<TokenUsageProps> = ({ code, mode }) => {
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    let newTokenCount;
    if(mode === 1){
      newTokenCount = Math.ceil(((code.length / 4) + 600 ) / 20);
      console.log(newTokenCount);
      setTokenCount(newTokenCount);
    } else if(mode === 2){
      newTokenCount = Math.ceil(((code.length / (4*5)) + 120) / 100);
      console.log(newTokenCount);
      setTokenCount(newTokenCount);
    }
    
  }, [code, mode]);

  return (
    <div className="token-usage">
      {mode === 1 ? `Token Usage: ${tokenCount-30}/275 + 30` : `Token Usage: ${tokenCount}/55 + 6`}
    </div>
  );
};

export default TokenUsage;
