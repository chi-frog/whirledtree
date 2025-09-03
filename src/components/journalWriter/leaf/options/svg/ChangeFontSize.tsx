'use client'

type Props = {
  x:number,
  y:number,
  width:number,
  height:number,
}

const ChangeFontSize:React.FC<Props> = ({
    x, y, width, height}:Props) => {
  return (<svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox="0 0 463.99997 261.15625"
      version="1.1"
      id="svg1"
      xmlns="http://www.w3.org/2000/svg">
      <defs
     id="defs1" />
    <g
      id="layer1"
      transform="translate(-8,-110.97168)">
      <text
          xmlSpace="preserve"
          fontStyle="normal"
          fontVariant="normal"
          fontWeight="normal"
          fontStretch="normal"
          fontSize="480px"
          fontFamily="Arial"
          letterSpacing="0px"
          direction="ltr"
          textAnchor="start"
          fill="#000000"
          x="108.47798"
          y="366.00293"
          id="text1">
        <tspan
            id="tspan1"
            strokeWidth="1"
            x="108.47798"
            y="366.00293">
          a
        </tspan>
      </text>
    <path
       id="path2"
       fill="none"
       stroke="#000000"
       strokeWidth="24"
       d="M 60,300 20,260 m 40,-80 v 120 l 40,-40" />
    <path
       id="path3"
       stroke="#000000"
       strokeWidth="24"
       d="m 420,180 -40,40 m 40,80 V 180 l 40,40" />
  </g>
  </svg>
  );
}

export default ChangeFontSize;