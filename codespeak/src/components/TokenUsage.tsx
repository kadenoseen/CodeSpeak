import React, { useEffect, useState } from 'react';

interface TokenUsageProps {
  code: string;
}

const TokenUsage: React.FC<TokenUsageProps> = ({ code }) => {
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    // Update the token count when the code changes
    const newTokenCount = Math.ceil(((code.length / 4) + 350 ) / 50);
    setTokenCount(newTokenCount);
  }, [code]);

  return (
    <div className="token-usage">
      Token Usage: {tokenCount}
    </div>
  );
};

export default TokenUsage;
