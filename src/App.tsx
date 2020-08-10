import React, { useRef, useEffect } from "react";
import "./styles.css";
import { Terrarium } from "./classes/Terrarium";
import { TERRARIUM_SIZE } from "./constants";

const terrarium = new Terrarium();

function renderLoop() {
  terrarium.doRender();
  requestAnimationFrame(renderLoop);
}

renderLoop();

export default function App() {
  const displayRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    const context = displayRef.current.getContext("2d");
    terrarium.initRenderingContext(context);
  }, [displayRef]);

  return (
    <canvas
      style={{
        imageRendering: "pixelated",
        width: TERRARIUM_SIZE.x * 2,
        backgroundColor: "lightgray"
      }}
      width={TERRARIUM_SIZE.x}
      height={TERRARIUM_SIZE.y}
      ref={displayRef}
    />
  );
}
