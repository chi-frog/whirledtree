'use client'

type Props = {
  children:React.ReactNode,
}

const Hoverp:React.FC<Props> = ({children}:Props) => {
  console.log('children', children);

  return (<>
    {children}
  </>);
};

export default Hoverp;