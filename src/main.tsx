import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { TransButton } from "./TransButton.tsx";
import { BoxStatesT } from "./type.ts";
import { getSelectionDirection } from "./hooks/selectionTools.ts";

const transBox = document.createElement("div");

let BoxStates: BoxStatesT = BoxStatesT.null;
let setboxStates: React.Dispatch<React.SetStateAction<BoxStatesT>> | null =
  null;

let selection: Selection | null = null;
let event: MouseEvent | null = null;

function mouseUp(e: MouseEvent) {
  if (!BoxStates || !setboxStates) return;
  selection = getSelection();
  event = e;

  if (!selection || selection.isCollapsed || !selection.toString()) {
    setboxStates(BoxStatesT.hidden);
    return;
  }

  if (BoxStates === BoxStatesT.hidden) {
    setboxStates(BoxStatesT.floatButton);
    return;
  }

  if (BoxStates === BoxStatesT.floatButton && !selection.toString()) {
    setboxStates(BoxStatesT.hidden);
    return;
  }

  if (BoxStates === BoxStatesT.tranBox && !selection.toString()) {
    setboxStates(BoxStatesT.hidden);
    return;
  }

  return;
}

document.addEventListener("mouseup", mouseUp);

interface MyContext {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
}

export const content = React.createContext<MyContext>({
  text: "",
  setText: () => {
    return;
  },
});

function Main() {
  const [BoxStatesInner, setboxStatesInner] = useState<BoxStatesT>(
    BoxStatesT.hidden
  );
  [BoxStates, setboxStates] = [BoxStatesInner, setboxStatesInner];

  const [mousePageX, setMousePageX] = useState<number | null>(null);
  const selectionRef = useRef<Selection | null>(null);

  const [text, setText] = useState(selection?.toString ?? "");

  useEffect(() => {
    if (!event || !selection) return;
    setMousePageX(event.pageX);
    selectionRef.current = selection;
    if (
      BoxStatesInner === BoxStatesT.tranBox ||
      BoxStatesInner === BoxStatesT.floatButton
    ) {
      setText(selection.toString());
    }
  }, [BoxStatesInner]);

  if (text && selectionRef.current) {
    const {
      top: rangeTop,
      height: rangeHeight,
      left: rangeLeft,
      bottom: rangeBottom,
    } = selectionRef.current.getRangeAt(0).getBoundingClientRect();
    const direction = getSelectionDirection(selectionRef.current) ?? 1;
    return (
      <>
        {BoxStates === BoxStatesT.tranBox && (
          <content.Provider value={{ text, setText }}>
            <div>
              {
                <App
                  direction={direction}
                  rangeTop={rangeTop}
                  rangeHeight={rangeHeight}
                  rangeLeft={rangeLeft}
                  rangeBottom={rangeBottom}
                ></App>
              }
            </div>
          </content.Provider>
        )}
        {BoxStates === BoxStatesT.floatButton && mousePageX && (
          <TransButton
            setboxStates={setboxStates}
            pageX={mousePageX}
            rangeTop={rangeTop}
            rangeHeight={rangeHeight}
            rangeLeft={rangeLeft}
            direction={direction}
          ></TransButton>
        )}
      </>
    );
  }
  return <></>;
}
mountTransBox();

function mountTransBox() {
  document.querySelector("body")?.appendChild(transBox);
  ReactDOM.createRoot(transBox as HTMLElement).render(
    <React.StrictMode>
      <Main></Main>
    </React.StrictMode>
  );
}
