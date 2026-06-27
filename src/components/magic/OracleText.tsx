'use client'

import { MagicSymbol } from "@/hooks/magic/useMagicSymbols";
import { useMemo } from "react";

type Props = {
  oracleText:string,
  symbols:MagicSymbol[],
  symbolImageMap:Map<string, string>
};
const OracleText:React.FC<Props> = ({oracleText, symbols, symbolImageMap}) => {
  const paragraphs = oracleText.split('\n');
  
  type Paragraph = (string|MagicSymbol)[];
  type TokenizeParagraph = (paragraph:string)=>Paragraph;
  const tokenizeParagraph:TokenizeParagraph = (paragraph) => {
    const relevantSymbols = symbols.filter(({symbol}) =>
                              paragraph.includes(symbol));

    const tokenizedParagraph = relevantSymbols.reduce<Paragraph>(
      (remaining, symbol) => {
        const parts = remaining.map((part) =>
          (typeof part === 'string' ||
           part instanceof String) ? part.split(symbol.symbol) :
                                    [part]);
                                    console.log('Parts', parts);
        const partsExpanded = parts.map((part) => {
          if (part.length <= 1) return part;
          let result = part.reduce<Paragraph>((expanded, phrase) =>
            [...expanded,
             phrase,
             symbol], []);
          result.splice(result.length - 1);
          return result;
        });
        const partsFlat = partsExpanded.flat();
        console.log('partsFlat', partsFlat);

        return partsFlat.filter((part) => part !== '');
      }, [paragraph]);

    return tokenizedParagraph;
  }

  const tokenizedParagraphs = paragraphs.map(tokenizeParagraph);
  console.log('tokenizedParagraphs', tokenizedParagraphs);

  const transformToken:(token:string|MagicSymbol, index:number)=>React.ReactNode = (token, index) => {
    if ((typeof token === 'string') ||
        (token instanceof String)) {
      return (<span key={index}>{token}</span>);
    } else {
      const imageUri = token.imageUri;
      return (
        <img key={index} src={imageUri}  alt="" className="icon" style={{
          width:'16px',
          margin:'1px',
          display:'inline',
        }}/>);
    }
  };

  const transformParagraph:(paragraph:Paragraph, index:number)=>React.ReactNode = (paragraph, index) => {
    return (
      <div key={index} style={{
        marginBottom: '1rem',
        whiteSpace:'preserve'}}>
        {paragraph.map(transformToken)}
      </div>);
  }

  const transformedOracleText = tokenizedParagraphs.map(transformParagraph);

  console.log('transformedOracleText', transformedOracleText);
  console.log('imageMap', symbolImageMap);
  
  return (
    <h3 className="selectable oracleText"
      style={{
        fontSize:'18px',
        flex:1,
        textAlign:'left',
        alignContent:'center',
        padding:'5%',
        whiteSpace:'pre-line',
      }}>
      {transformedOracleText}
    </h3>);
};

export default OracleText;