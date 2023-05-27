export function getSelectionDirection(selection: Selection) {
  if (!selection || selection.isCollapsed) {
    return null; // 没有选区或选区已折叠
  }

  const anchorNode = selection.anchorNode;
  const anchorOffset = selection.anchorOffset;
  const focusNode = selection.focusNode;
  const focusOffset = selection.focusOffset;

  if (!(anchorNode && anchorOffset && focusNode && focusOffset)) return null;

  // 比较节点位置
  const position = anchorNode.compareDocumentPosition(focusNode);

  if (position === 0) {
    // 相同节点
    return anchorOffset <= focusOffset ? 1 : -1;
  } else if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    // anchorNode 在 focusNode 之前
    return 1;
  } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    // anchorNode 在 focusNode 之后
    return -1;
  }

  return null; // 未知方向
}
