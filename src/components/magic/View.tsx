'use client'

import { MagicCard } from "./types/default";
import { ImageMap } from "./SearchResults";

type Props = {
  loading:boolean,
  getRef:(id:number, node:any) => () => void,
  filterDragging:boolean,
  dragging:boolean,
  filterHidden:boolean,
  yCutoffHidden:number,
  filterDragLocation:{x:number, y:number},
  numCardsRow:number,
  cards:MagicCard[],
  imageMap:ImageMap,
  handleCardPointerEnter:(e:React.PointerEvent, index:number) => void,
  handleCardPointerLeave:(e:React.PointerEvent, index:number) => void,
  handleCardPointerDown:(e:React.PointerEvent, index:number) => void,
  handleCardPointerUp:(e:React.PointerEvent, index:number) => void,
}

const View:React.FC<Props> = ({
    loading,
    getRef,
    filterDragging,
    dragging,
    filterHidden,
    yCutoffHidden,
    filterDragLocation,
    numCardsRow,
    cards,
    imageMap,
    handleCardPointerEnter,
    handleCardPointerLeave,
    handleCardPointerDown,
    handleCardPointerUp,
  }:Props) => {


  return (
    <div className="hover:bg-blue" style={{
      cursor:(filterDragging || dragging) ? 'grabbing' : 'move',
      paddingTop:`${(filterHidden) ? Math.min(yCutoffHidden + filterDragLocation.y, 80) : 80}px`,
      overflow:'scroll',
      minWidth:'100vw',
      minHeight:'100vh',
      width:'fit-content',
      paddingLeft:'15px',
      paddingRight:'15px',
      backgroundColor:'black',
      userSelect:(filterDragging || dragging) ? 'none' : 'auto',
      transition:(filterDragging) ? "" : 'padding 0.1s ease-in-out',
      color: 'black',
      display:'grid',
      gridTemplateColumns:`repeat(${numCardsRow}, 1fr)`,
      }}>
      {loading &&
      <h4 style={{
        textAlign:'center',
        textAnchor:'middle',
        }}>Loading...</h4>}
      {!loading &&
      cards.map((_card, _index)=>(
        <div key={_card.name} ref={getRef.bind(null, _index)}
          onPointerEnter={(e)=>handleCardPointerEnter(e, _index)}
          onPointerLeave={(e)=>handleCardPointerLeave(e, _index)}
          onPointerDown={(e) => handleCardPointerDown(e, _index)}
          onPointerUp={(e) => handleCardPointerUp(e, _index)} style={{
            display:'flex',
            cursor:(filterDragging || dragging) ? 'grabbing' : 'hand',
            flexDirection:'column',
            margin:'5px',
            overflow:'hidden',
            borderRadius:'12px',
            border:'1px solid rgba(255, 255, 255, 0.7)',
            transition:'top 0.3s ease-in-out',
            minWidth:'100px',
            height:'fit-content'
            }}>
          <img src={imageMap.get(_card.name)?.smallBlob} draggable="false" style={{
            maxWidth:'100%',
            cursor:(filterDragging || dragging) ? 'grabbing' : 'pointer',
            marginTop:'auto',
           }}/>
        </div>
      ))}
    </div>
  );
};

export default View;