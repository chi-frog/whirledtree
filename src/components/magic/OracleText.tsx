'use client'

type Props = {
  oracleText:string,
};
const OracleText:React.FC<Props> = ({oracleText}) => {
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
      {oracleText.split('\n').map((line, i) => (
        <div key={i} style={{ marginBottom: '1rem' }}>
          {line}
        </div>
      ))}
    </h3>);
};

export default OracleText;