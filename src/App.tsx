import { useContext, useEffect, useState } from "react";
import { content } from "./main";
import { getScrollPosition } from "./hooks/positionTools";

// TODO 从插件弹出页面设置toekn和url等
const token = import.meta.env.VITE_TOKEN;
const url = import.meta.env.VITE_URL;
function* eventParser(content: string) {
  for (const item of content.split(/\n/)) {
    if (!item.trim()) continue;
    yield item.substring(6);
  }
}
async function* toStream(stream: ReadableStreamDefaultReader<Uint8Array>) {
  const DecoderStream = new TextDecoderStream("utf-8");
  (async () => {
    const writer = DecoderStream.writable.getWriter();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await stream.read();

      if (done) break;

      writer.write(value);
    }
    writer.releaseLock();

    await DecoderStream.writable.close();
  })();
  const textReader = DecoderStream.readable.getReader();
  while (true) {
    const { value, done } = await textReader.read();
    if (done) break;
    yield value;
  }
}
async function trans(
  url: string,
  text: string,
  setText: React.Dispatch<React.SetStateAction<string>>,
  signal: AbortController["signal"]
) {
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accept: "text/event-stream",
    },
    signal,
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `帮我把下面的话翻译成英文,不要有多余的解释`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      stream: true,
    }),
  });
  const reader = response.body!.getReader();
  for await (const value of toStream(reader)) {
    if (signal.aborted) break;
    for (const event of eventParser(value)) {
      if (signal.aborted) break;
      if (event == "[DONE]") return;
      let data: Record<string, any> = {};
      try {
        data = JSON.parse(event);
      } catch (error) {
        console.error(error);
        continue;
      }
      const content = data.choices?.[0].delta.content;
      if (!content) continue;
      setText((p) => p + content);
    }
  }
}

function App(props: {
  rangeTop: number;
  rangeHeight: number;
  rangeLeft: number;
  direction: number;
  rangeBottom: number;
}) {
  const { text } = useContext(content);
  const [transResult, setTransResult] = useState("");

  useEffect(() => {
    const AbortControl = new AbortController();
    trans(url, text, setTransResult, AbortControl.signal);
    return () => {
      AbortControl.abort();
    };
  }, [text]);

  const [top, setTop] = useState(0);

  useEffect(() => {
    let topInner = props.rangeTop + props.rangeHeight + getScrollPosition().y;

    if (props.direction < 0) {
      topInner = props.rangeTop + getScrollPosition().y - 25;
    }

    if (
      document.querySelector("body")?.getBoundingClientRect().bottom ??
      2000 - props.rangeHeight < 50
    ) {
      topInner = topInner - props.rangeHeight - 60;
    }

    setTop(topInner);
  }, []);

  // let top = props.rangeTop + props.rangeHeight + getScrollPosition().y;

  // // 从后往前
  // if (props.direction < 0) {
  //   top = props.rangeTop + getScrollPosition().y - 25;
  // }

  // if (innerHeight - props.rangeHeight < 50) {
  //   top = top - props.rangeHeight - 200;
  // }

  const left = props.rangeLeft + "px";

  return (
    <p
      className="tran-box"
      style={{
        top: top + "px",
        left: left + "px",
      }}
    >
      {transResult}
    </p>
  );
}

export default App;
