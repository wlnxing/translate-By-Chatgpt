import { getScrollPosition } from "./hooks/positionTools";
import { BoxStatesT } from "./type";

export function TransButton(props: {
  pageX: number;
  rangeTop: number;
  rangeHeight: number;
  rangeLeft: number;
  direction: number;
  setboxStates: React.Dispatch<React.SetStateAction<BoxStatesT>>;
}) {
  const { y: scrollY } = getScrollPosition();

  // 默认从前往后
  let top = props.rangeTop + props.rangeHeight + scrollY + "px";

  const left = props.pageX + "px";

  if (props.direction < 0) {
    // 从后往前
    top = props.rangeTop + scrollY - 25 + "px";
  }
  return (
    <div
      onClick={() => props.setboxStates(BoxStatesT.tranBox)}
      className="trans"
      style={{
        top,
        left,
      }}
    >
      翻译
    </div>
  );
}
