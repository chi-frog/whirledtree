'use client'

import { MagicSymbol } from "@/hooks/magic/useMagicSymbols";
import { useMemo } from "react";

enum MagicTextType {
  NORMAL = 'normal',
  HELPER = 'helper',
}
type MagicText = {
  type:MagicTextType,
  content:string,
}
const isMagicText = (obj:MagicText|MagicSymbol) => ('type' in obj);

type Props = {
  oracleText:string,
  symbols:MagicSymbol[],
  symbolImageMap:Map<string, string>
};
const OracleText:React.FC<Props> = ({oracleText, symbols, symbolImageMap}) => {
  const paragraphs = oracleText.split('\n');
  
  type Paragraph = (MagicText|MagicSymbol)[];
  type TokenizeParagraph = (paragraph:string)=>Paragraph;
  const tokenizeParagraph:TokenizeParagraph = (paragraph) => {
    const magicParagraph = {type:MagicTextType.NORMAL, content:paragraph};
    let helperTextTokens:MagicText[] = [];

    const openingParenthesis = magicParagraph.content.indexOf('(');
    if (openingParenthesis < 0) helperTextTokens = [magicParagraph];

    const endingParenthesis = magicParagraph.content.indexOf(')');
    if (endingParenthesis < 0)
      helperTextTokens = [magicParagraph];

    else {
      const start = magicParagraph.content.substring(0, openingParenthesis);
      const helper = magicParagraph.content.substring(openingParenthesis, endingParenthesis + 1);
      const end = magicParagraph.content.substring(endingParenthesis + 1);
        
      if (start !== "") helperTextTokens.push({
        type:MagicTextType.NORMAL,
        content: start});
      helperTextTokens.push({
        type:MagicTextType.HELPER,
        content:helper});
      if (end !== "") helperTextTokens.push({
        type:MagicTextType.NORMAL,
        content:end});
    }

    const relevantSymbols = symbols.filter(({symbol}) =>
                              paragraph.includes(symbol));

    const tokenizedParagraph = relevantSymbols.reduce<Paragraph>(
      (remaining, symbol) => {  
        const parts = remaining.map((part) =>
          isMagicText(part) ? part.content.split(symbol.symbol).map(
                                (_part) => ({type:part.type, content:_part})) :
                              [part]);
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

        return partsFlat.filter((part) => !isMagicText(part) || part.content !== '');
      }, helperTextTokens);

    return tokenizedParagraph;
  }

  const tokenizedParagraphs = paragraphs.map(tokenizeParagraph);

  const transformToken:(token:MagicText|MagicSymbol, index:number)=>React.ReactNode = (token, index) => {
    if (isMagicText(token))
      return (token.type === MagicTextType.NORMAL) ?
        (<span key={index*10} className="normalText">{token.content}</span>) :
        (<span key={index*10} className="helperText" style={{
          fontStyle:'italic'}}>
          {token.content}</span>);
    else
      return (
        <img key={index} src={token.imageUri}  alt="" className="icon" style={{
          width:'16px',
          margin:'1px',
          display:'inline',
        }}/>);
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
  
  return (
    <h3 className="selectable oracleText" title="Search By Oracle Text"
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