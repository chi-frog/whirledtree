'use client'

type Props = {
  x:number,
  y:number,
  width:number,
  height:number,
}

const ChangeFontSize:React.FC<Props> = ({
    x, y, width, height}:Props) => {
  return (<image
    x={x}
    y={y}
    width={width}
    height={height}
    href="/images/Leaf_Options_FontSizeP.svg"
    style={{
      pointerEvents:'none'
    }}/>);
}

export default ChangeFontSize;