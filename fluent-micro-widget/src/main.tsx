import { FluentProvider, webDarkTheme, webLightTheme } from "@fluentui/react-components";
import { useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { TopFailingTestCasesWidget } from "./TopFailingTestCasesWidget";

function subscribeBodyDark(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

function getBodyIsDark() {
  return document.body.classList.contains("dark");
}

function App() {
  const isDark = useSyncExternalStore(subscribeBodyDark, getBodyIsDark, getBodyIsDark);
  return (
    <FluentProvider theme={isDark ? webDarkTheme : webLightTheme}>
      <TopFailingTestCasesWidget />
    </FluentProvider>
  );
}

const el = document.getElementById("fluent-micro-widget-root");
if (el) {
  createRoot(el).render(<App />);
}
