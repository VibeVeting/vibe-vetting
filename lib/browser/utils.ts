export const TEST_INJECTION_FLAG = "__TEST_INJECTION_FLAG__";

export const visibleText = (el: Element | null) => {
  if (!el) return "";
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let p: Element | null = node.parentElement;
      while (p) {
        if (p.classList.contains("visually-hidden")) {
          return NodeFilter.FILTER_REJECT;
        }
        p = p.parentElement;
      }
      return node.textContent && node.textContent.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  const parts: string[] = [];
  while (walker.nextNode()) {
    parts.push(walker.currentNode.textContent?.trim() ?? "");
  }
  return parts.join(" ").trim();
};
