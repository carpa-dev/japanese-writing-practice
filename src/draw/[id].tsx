import styles from "../../styles/draw.module.css";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { Kanji } from "../models/kanji.schema";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSyncContext, sendToOtherDevices } from "../../pages/sync";
import { Tiles } from "./Tiles";
import { Tutorial } from "./Tutorial";
import { Title } from "./Title";
import { KeyboardHandler } from "./Keyboard";
import { Toolbar } from "./Toolbar";
import { useZoom } from "./useZoom";
import { useCanvasObserver } from "./useCanvasObserver";

const PracticeCanvas = dynamic(() => import("./PracticeCanvas"), {
  ssr: false,
});

export default function Draw(props: { kanjis: Kanji[] }) {
  const router = useRouter();
  const canvasRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const { canvasWidth, canvasHeight } = useCanvasObserver({
    canvasWrapRef,
    canvasRef,
  });
  const [assist, setAssist] = useState(true);
  const word = props.kanjis.map((a) => a.name).join("");
  const { syncConfig, toggleLocked } = useSyncContext();
  const { tileWidth, zoomIn, zoomOut, canZoomIn, canZoomOut } = useZoom({
    canvasWidth,
  });

  // Clear canvas when word changes
  useEffect(() => {
    canvasRef.current?.clear();
  }, [word]);

  return (
    <div className={styles.container}>
      {/* More strict logic to go back to the main page if there's nothing in history */}
      <button onClick={() => router.back()}>Go Back</button>
      <Link href="/">Go to home page</Link>

      <div className={styles.title}>
        <Title characters={props.kanjis} />
      </div>
      <div className={styles.reference}>
        <h4>Tutorial:</h4>
        <Tutorial characters={props.kanjis} />
      </div>
      <div>
        <h4>Practice:</h4>

        <Toolbar
          canvasRef={canvasRef}
          toggleAssist={() => setAssist((prevAssist) => !prevAssist)}
          sync={() => sendToOtherDevices(word)}
          isLocked={syncConfig.locked}
          toggleLocked={toggleLocked}
          canZoomIn={canZoomIn}
          canZoomOut={canZoomOut}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
        />

        <div ref={canvasWrapRef} className={styles.canvasContainer}>
          <div>
            <div id="tiles" className={styles.tiles}>
              {typeof window !== "undefined" && (
                <Tiles
                  tileWidth={tileWidth}
                  word={word}
                  assistEnabled={assist}
                  canvasWidth={canvasWidth}
                  windowWidth={window.innerWidth}
                />
              )}
            </div>
          </div>

          <KeyboardHandler canvasRef={canvasRef} />
          <PracticeCanvas
            forwardRef={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className={styles.canvas}
          ></PracticeCanvas>
        </div>
      </div>
    </div>
  );
}
