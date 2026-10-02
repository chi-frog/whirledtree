'use client'

import { MagicSymbol } from "../types/magic";

type Props = {
  symbol:MagicSymbol,
};
const ManaSymbol:React.FC<Props> = ({
  symbol,
}) => {
  return (
    <img draggable="false" src={symbol.imageUri} alt={symbol.symbol}
      className="icon"
      width={24}
      height={24}
      style={{
        width:'24px',
        height:'24px',
        borderRadius:'50%',
        boxShadow:'-0.8px 1.5px black',
        margin:'1px',
      }}/>
  );
};

export default ManaSymbol;