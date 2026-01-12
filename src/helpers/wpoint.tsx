export type WPoint = {
  x:number,
  y:number,
}

export const _wpoint:WPoint = {
  x:0,
  y:0,
}

export const addWPoints = (a:WPoint, b:WPoint) =>
  ({x:a.x+b.x, y:a.y+b.y});

export const clamp = (v:number, max:number) =>
  Math.max(-max, Math.min(v, max));

export const caddWPoints = (a:WPoint, b:WPoint, max:number) => {
  const r = addWPoints(a, b);
  return {
    x: clamp(r.x, max),
    y: clamp(r.y, max),
  };
};

export const subWPoint = (a:WPoint, b:number) =>
  ({x:a.x-b, y:a.y-b});

export const subWPoints = (a:WPoint, b:WPoint) =>
  ({x:a.x-b.x, y:a.y-b.y});

export const applyFriction = (v:number, f:number) =>
  applyFrictionTo(v, 0, f);

export const applyFrictionTo = (v: number, target: number, f: number) => {
  const delta = v - target;

  if (Math.abs(delta) <= f) return target;

  return v - Math.sign(delta) * f;
};

export const ftsubWPoints = (a:WPoint, target:WPoint, f:WPoint) => ({
  x: applyFrictionTo(a.x, target.x, f.x),
  y: applyFrictionTo(a.y, target.y, f.y),
});

export const fsubWPoints = (a:WPoint, f:WPoint) => ({
  x: applyFriction(a.x, f.x),
  y: applyFriction(a.y, f.y),
});

export const divWPoint = (a:WPoint, b:number) => ({
  x:a.x/b,
  y:a.y/b,
});

export const makeWPoint = ({x, y}:PointerEvent|WPoint) => {
  return {x, y}
}