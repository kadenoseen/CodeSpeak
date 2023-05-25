import React, { useEffect, useState } from 'react';

interface TokenUsageProps {
  code: string;
}

const TokenUsage: React.FC<TokenUsageProps> = ({ code }) => {
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    // Update the token count when the code changes
    const newTokenCount = Math.ceil(((code.length / 3) + 350 ) / 35);
    setTokenCount(newTokenCount);
  }, [code]);

  return (
    <div className="token-usage">
      Token Usage: {tokenCount-10}/180 + 10
    </div>
  );
};

export default TokenUsage;
