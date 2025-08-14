import { elementsFromPoint } from "./dom";

export const REGION = {
  TOP_LEFT_CORNER: {'text':'Top Left Corner'},
  TOP_RIGHT_CORNER: {'text':'Top Right Corner'},
  BOTTOM_LEFT_CORNER: {'text':'Bottom Left Corner'},
  BOTTOM_RIGHT_CORNER: {'text':'Bottom Right Corner'},
  TOP_SIDE: {'text':'Top Side'},
  BOTTOM_SIDE: {'text':'Bottom Side'},
  LEFT_SIDE: {'text':'Left Side'},
  RIGHT_SIDE: {'text':'Right Side'},
  BODY: {'text':'Body'},
  BODY_FOCUSED: {'text': 'Body (Focused)'},
  NONE: {'text': 'None'},
}

const DEFAULT_GRAB_PADDING = 5;
const within = (left:number, right:number, value:number) => ((value>=left) && (value<=right))

export const getRegion = (x:number,y:number,rect:any) => {
    let bottom = rect.y+rect.height;
    let right = rect.x+rect.width;

    if (within(rect.x, rect.x+DEFAULT_GRAB_PADDING, x)) {
      if (within(rect.y, rect.y+DEFAULT_GRAB_PADDING, y))
        return REGION.TOP_LEFT_CORNER;
      if (within(bottom-DEFAULT_GRAB_PADDING, bottom, y))
        return REGION.BOTTOM_LEFT_CORNER;
      return REGION.LEFT_SIDE;
    }

    if (within(right-DEFAULT_GRAB_PADDING, right, x)) { // Right Side
      if (within(rect.y, rect.y+DEFAULT_GRAB_PADDING, y))
        return REGION.TOP_RIGHT_CORNER;
      if (within(bottom-DEFAULT_GRAB_PADDING, bottom, y))
        return REGION.BOTTOM_RIGHT_CORNER;
      return REGION.RIGHT_SIDE;
    }

    if (within(rect.y, rect.y+DEFAULT_GRAB_PADDING, y))
      return REGION.TOP_SIDE;
    if (within(bottom-DEFAULT_GRAB_PADDING, bottom, y))
      return REGION.BOTTOM_SIDE;

    return REGION.BODY;
  };

    export const getMouseoverRegion = (x:number, y:number, focusedId:number) => {
      const domElements = elementsFromPoint(x, y, "svg");
  
      if (domElements.length === 0)
        return REGION.NONE;
  
      // This will be a tspan - we want the text
      const domText = domElements[0].parentElement;
  
      if (!domText)
        return REGION.NONE;
  
      if (domText.getAttribute('data-elementid') === "" + focusedId)
        return REGION.BODY_FOCUSED;
    
      return getRegion(x, y, domElements[0].getBoundingClientRect());
    }