export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const frameAt = (progress, count) => Math.round(clamp(progress / 0.94) * (count - 1));
export const textAt = (distance) => { const p = clamp(distance / 150); return { opacity: 1 - p, z: -320 * p }; };
// Trim only the new export's rounded black border, symmetrically.
export const sourceCrop = (width, height) => ({x:width*.02,y:height*.02,w:width*.96,h:height*.96});
export function coverRect(iw, ih, width, height, focus = 0.6) {
 const scale = Math.max(width / iw, height / ih);
 return { x: (width-iw*scale)*focus, y: (height-ih*scale)/2, w: iw*scale, h: ih*scale };
}
