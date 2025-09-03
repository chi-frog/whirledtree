'use client'

type Props = {
  x:number,
  y:number,
  width:number,
  height:number,
}

const ChangeFont:React.FC<Props> = ({
    x, y, width, height}:Props) => {
  return (<image
    x={x}
    y={y}
    width={width}
    height={height}
    href="/images/Leaf_Options_FontSpecialP.svg"
    style={{
      'pointerEvents':'none'
    }}/>);
}

export default ChangeFont;