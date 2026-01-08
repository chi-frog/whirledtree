export type WPoint = {
  x:number,
  y:number,
}

export const _wpoint:WPoint = {
  x:0,
  y:0,
}

export const addWPoints = (a:WPoint, b:WPoint) => {
  return {x:a.x+b.x, y:a.y+b.y}
}

export const subWPoints = (a:WPoint, b:WPoint) => {
  return {x:a.x-b.x, y:a.y-b.y}
}

export const makeWPoint = ({x, y}:PointerEvent) => {
  return {x, y}
}