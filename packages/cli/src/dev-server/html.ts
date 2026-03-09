// =============================================================================
// Dev Server HTML — serves a React Native Web preview harness
//
// Uses esm.sh CDN for React, ReactDOM, and react-native-web.
// The user's bundle is loaded via /app.js and evaluated in-page.
// =============================================================================

export function getHarnessHtml(errors: string[] = []): string {
  const errorsJson = JSON.stringify(errors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>Plotpaper Dev</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; background: #111; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

    .container { display: flex; height: 100%; align-items: center; justify-content: center; flex-direction: column; gap: 16px; }
    .phone { width: 390px; height: 844px; background: #fff; border-radius: 44px; overflow: hidden; box-shadow: 0 0 0 4px #333, 0 20px 60px rgba(0,0,0,0.6); position: relative; }
    .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 126px; height: 34px; background: #000; border-radius: 0 0 20px 20px; z-index: 10; }
    .phone-content { height: 100%; overflow: auto; -webkit-overflow-scrolling: touch; }
    #app { height: 100%; display: flex; flex-direction: column; }

    .error-screen { padding: 60px 24px 24px; background: #1a1a2e; color: #ff6b6b; height: 100%; overflow: auto; font-family: monospace; }
    .error-screen h2 { font-size: 16px; margin-bottom: 16px; font-family: -apple-system, sans-serif; }
    .error-screen pre { font-size: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; color: #ffa8a8; background: rgba(255,107,107,0.08); padding: 16px; border-radius: 8px; }

    .toolbar { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
    .toolbar button { padding: 6px 14px; border: 1px solid #333; border-radius: 6px; background: #1a1a1a; color: #aaa; cursor: pointer; font-size: 12px; transition: all 0.15s; }
    .toolbar button:hover { background: #222; color: #fff; border-color: #555; }

    .loading { display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 14px; }
    .badge { position: fixed; top: 12px; left: 12px; background: #1a1a1a; color: #666; font-size: 11px; padding: 4px 10px; border-radius: 4px; border: 1px solid #333; }
  </style>
</head>
<body>
  <div class="badge">plotpaper dev</div>
  <div class="container">
    <div class="phone">
      <div class="phone-notch"></div>
      <div class="phone-content">
        <div id="app"><div class="loading">Loading...</div></div>
      </div>
    </div>
  </div>
  <div class="toolbar">
    <button onclick="toggleTheme()">Toggle Theme</button>
    <button onclick="location.reload()">Reload</button>
  </div>

  <script type="module">
    const ERRORS = ${errorsJson};

    if (ERRORS.length > 0) {
      document.getElementById("app").innerHTML =
        '<div class="error-screen"><h2>Build Errors</h2><pre>' +
        ERRORS.map(e => "\\u2717 " + e).join("\\n\\n") +
        "</pre></div>";
    } else {
      try {
        const [reactMod, reactDomMod, rnWebMod] = await Promise.all([
          import("https://esm.sh/react@18.3.1"),
          import("https://esm.sh/react-dom@18.3.1/client"),
          import("https://esm.sh/react-native-web@0.19.13?deps=react@18.3.1,react-dom@18.3.1"),
        ]);

        const React = reactMod;
        const ReactDOM = reactDomMod;
        const RN = rnWebMod;

        let isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        const LIGHT = {
          background: "#FFFFFF", foreground: "#0A1914", card: "#F8F9FA", cardForeground: "#0A1914",
          primary: "#0A1914", primaryForeground: "#FEF6F7", secondary: "#F1F5F0", secondaryForeground: "#0A1914",
          muted: "#F1F5F0", mutedForeground: "#6B7C72", accent: "#E8F0E6", accentForeground: "#0A1914",
          border: "#E2E8DE", input: "#E2E8DE", destructive: "#EF4444", success: "#2CD15E", warning: "#F59E0B", info: "#3B82F6",
        };
        const DARK = {
          background: "#0A0F0D", foreground: "#F0F5F2", card: "#141A16", cardForeground: "#F0F5F2",
          primary: "#D4611F", primaryForeground: "#FFFFFF", secondary: "#1C2420", secondaryForeground: "#F0F5F2",
          muted: "#1C2420", mutedForeground: "#8A9B90", accent: "#1C2420", accentForeground: "#F0F5F2",
          border: "#243028", input: "#243028", destructive: "#EF4444", success: "#2CD15E", warning: "#F59E0B", info: "#3B82F6",
        };

        // --- Mock SDK Context ---
        const PlotpaperSDKContext = React.createContext(null);

        function usePlotpaperSDK() {
          const sdk = React.useContext(PlotpaperSDKContext);
          if (!sdk) throw new Error("usePlotpaperSDK() must be called inside a Plotpaper mini app.");
          return sdk;
        }

        // --- Tab Navigator (web) ---
        function TabNavigator({ tabs, theme, initialTab, showLabels = true, sdk }) {
          const [active, setActive] = React.useState(initialTab || (tabs[0] && tabs[0].key) || "");
          const c = theme.colors;
          const nav = { navigate: (k) => setActive(k), currentTab: active };
          const tab = tabs.find(t => t.key === active) || tabs[0];
          return React.createElement(RN.View, { style: { flex: 1 } },
            React.createElement(RN.View, { style: { flex: 1 } },
              tab ? React.createElement(tab.screen, { sdk, navigation: nav }) : null
            ),
            React.createElement(RN.View, { style: { flexDirection: "row", borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.card, paddingBottom: 20, paddingTop: 8 } },
              tabs.map(t => React.createElement(RN.Pressable, { key: t.key, onPress: () => setActive(t.key), style: { flex: 1, alignItems: "center", padding: 8 } },
                React.createElement(RN.Text, { style: { fontSize: 11, marginTop: 2, color: t.key === active ? c.primary : c.mutedForeground, fontWeight: t.key === active ? "600" : "400" } }, t.title)
              ))
            )
          );
        }

        // --- Stack Navigator (web) ---
        function StackNavigator({ screens, initialScreen, theme, showHeader = true, sdk }) {
          const [stack, setStack] = React.useState([{ name: initialScreen }]);
          const c = theme.colors;
          const cur = stack[stack.length - 1];
          const cfg = screens[cur.name];
          const nav = {
            push: (n, p) => setStack(s => [...s, { name: n, params: p }]),
            pop: () => setStack(s => s.length > 1 ? s.slice(0, -1) : s),
            popToRoot: () => setStack(s => [s[0]]),
            canGoBack: () => stack.length > 1,
          };
          return React.createElement(RN.View, { style: { flex: 1, backgroundColor: c.background } },
            showHeader ? React.createElement(RN.View, { style: { height: 48, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.card, paddingHorizontal: 4 } },
              stack.length > 1
                ? React.createElement(RN.Pressable, { onPress: nav.pop, style: { width: 44, height: 44, alignItems: "center", justifyContent: "center" } },
                    React.createElement(RN.Text, { style: { color: c.primary, fontSize: 20 } }, "\\u2190"))
                : React.createElement(RN.View, { style: { width: 44 } }),
              React.createElement(RN.Text, { style: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "600", color: c.foreground } }, cfg ? cfg.title : cur.name),
              React.createElement(RN.View, { style: { width: 44 } })
            ) : null,
            React.createElement(RN.View, { style: { flex: 1 } },
              cfg ? React.createElement(cfg.screen, { sdk, navigation: nav, route: { name: cur.name, params: cur.params } }) : null
            )
          );
        }

        // --- Feather Icon Stub ---
        function Feather({ name, size = 16, color = "#000" }) {
          return React.createElement(RN.Text, { style: { fontSize: size, color, lineHeight: size } }, "\\u25C6");
        }

        // --- SVG Stubs ---
        const makeSvg = (tag) => (props) => React.createElement(tag, props);
        const svgStub = { default: makeSvg("svg"), Svg: makeSvg("svg"), Circle: makeSvg("circle"), Rect: makeSvg("rect"), Line: makeSvg("line"), Path: makeSvg("path"), G: makeSvg("g"), Text: makeSvg("text"), Polygon: makeSvg("polygon"), Polyline: makeSvg("polyline"), Ellipse: makeSvg("ellipse"), Defs: makeSvg("defs"), Stop: makeSvg("stop"), LinearGradient: makeSvg("linearGradient"), RadialGradient: makeSvg("radialGradient") };

        // --- Safe Area Stubs ---
        const safeAreaStub = {
          SafeAreaView: (props) => React.createElement(RN.View, props),
          SafeAreaProvider: (props) => props.children,
          useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
        };

        // --- Module Registry ---
        globalThis.__ppModules = {
          "react": React,
          "react-native": RN,
          "@plotpaper/mini-app-sdk": { usePlotpaperSDK, PlotpaperSDKContext, TabNavigator, StackNavigator },
          "@expo/vector-icons/Feather": { default: Feather, __esModule: true },
          "react-native-svg": svgStub,
          "react-native-safe-area-context": safeAreaStub,
        };
        globalThis.__ppMiniApps = {};

        // --- Mock SDK Factory ---
        function createMockSDK() {
          const colors = isDark ? DARK : LIGHT;
          return {
            theme: { mode: isDark ? "dark" : "light", colors },
            db: {
              useQuery: () => ({ isLoading: false, error: null, data: {} }),
              transact: (...args) => console.log("[plotpaper dev] transact:", args),
              tx: new Proxy({}, { get: (_, entity) => new Proxy({}, { get: (_, id) => ({ update: (d) => ({ op: "update", entity, id, d }), delete: () => ({ op: "delete", entity, id }) }) }) }),
              id: () => crypto.randomUUID(),
            },
            ai: {
              generateText: async () => ({ text: "[Mock] AI text response" }),
              generateObject: async () => ({ object: {} }),
              generateImage: async () => ({ url: "https://placehold.co/400x400/1a1a2e/ffffff?text=Mock" }),
              generateImages: async ({ prompts }) => ({ images: prompts.map(() => ({ url: "https://placehold.co/400x400/1a1a2e/ffffff?text=Mock" })) }),
            },
            getAppInfo: async () => ({ appId: "dev", appName: "Dev App", sdkVersion: 1 }),
            getUserInfo: async () => ({ displayName: "Dev User", imageUrl: null, profileId: "dev-user" }),
            getSpaceInfo: async () => ({ spaceId: "dev-space", spaceName: "Dev Space" }),
            close: async () => true,
            showToast: async (m) => { console.log("[plotpaper dev] Toast:", m); return true; },
            getCredits: async () => ({ available: 10000 }),
            consumeCredits: async (a, r) => { console.log("[plotpaper dev] consumeCredits:", a, r); return { success: true, remaining: 9900 }; },
            setFeedAction: async (a) => { console.log("[plotpaper dev] setFeedAction:", a); return true; },
            clearFeedAction: async () => true,
            getProfileById: async () => null,
            getSpaceMembers: async () => [],
            openProfile: async () => true,
            composeMessage: async () => true,
            shareContext: async () => ({}),
            scheduleNotification: async () => true,
            cancelNotification: async () => true,
            cancelAllNotifications: async () => true,
            getScheduledNotifications: async () => [],
            on: () => () => {},
          };
        }

        // --- Load User Bundle ---
        const resp = await fetch("/app.js?t=" + Date.now());
        const code = await resp.text();

        try {
          new Function(code)();
        } catch (e) {
          document.getElementById("app").innerHTML =
            '<div class="error-screen"><h2>Runtime Error</h2><pre>' + String(e) + "\\n\\n" + (e.stack || "") + "</pre></div>";
          throw e;
        }

        const entries = Object.values(globalThis.__ppMiniApps);
        if (entries.length === 0) {
          document.getElementById("app").innerHTML =
            '<div class="error-screen"><h2>No Component</h2><pre>Bundle did not register a component.\\nMake sure your app has: export default function App() { ... }</pre></div>';
        } else {
          const { component: UserApp } = entries[0];
          let sdk = createMockSDK();
          const root = ReactDOM.createRoot(document.getElementById("app"));

          function render() {
            root.render(React.createElement(PlotpaperSDKContext.Provider, { value: sdk }, React.createElement(UserApp)));
          }
          render();

          window.toggleTheme = () => {
            isDark = !isDark;
            document.querySelector(".phone").style.background = isDark ? "#0A0F0D" : "#fff";
            sdk = createMockSDK();
            render();
          };
        }
      } catch (e) {
        document.getElementById("app").innerHTML =
          '<div class="error-screen"><h2>Failed to Load</h2><pre>' + String(e) +
          "\\n\\nMake sure you have internet access (modules are loaded from esm.sh CDN).</pre></div>";
      }
    }

    // --- Live Reload via SSE ---
    const es = new EventSource("/sse");
    es.addEventListener("reload", () => location.reload());
    es.onerror = () => setTimeout(() => location.reload(), 2000);
  </script>
</body>
</html>`;
}
