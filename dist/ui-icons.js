// Shared presentation-only vector language for the live vehicle display.
const shapes={
 settings:'M5 3v18M12 3v18M19 3v18M2 8h6M9 16h6M16 10h6',
 music:'M9 18V5l11-2v13M9 7l11-2M9 18c0 1.7-1.6 3-3.5 3S2 19.9 2 18.5 3.6 16 5.5 16 9 16.7 9 18Zm11-2c0 1.7-1.6 3-3.5 3S13 17.9 13 16.5s1.6-2.5 3.5-2.5 3.5.7 3.5 2Z',
 navigation:'M12 3 3 20l9-4 9 4-9-17Zm0 0v13',
 heat:'M5 20h14M6 16c-3-3 3-5 0-8M12 16c-3-3 3-5 0-8M18 16c-3-3 3-5 0-8',
 previous:'M5 5v14M18 5 8 12l10 7V5Z',
 next:'M19 5v14M6 5l10 7-10 7V5Z',
 play:'M7 4v16l13-8L7 4Z',
 pause:'M8 4v16M16 4v16'
};
const paths=new Map();
export function canvasIcon(ctx,name,x,y,size,color='#48484a'){
 if(!paths.has(name))paths.set(name,new Path2D(shapes[name]));
 ctx.save();ctx.translate(x,y);ctx.scale(size/24,size/24);ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(paths.get(name));ctx.restore();
}
