# Navigation

Import navigation components from the SDK:

```tsx
import { usePlotpaperSDK, TabNavigator, StackNavigator } from "@plotpaper/mini-app-sdk";
```

## TabNavigator

Config-driven tab bar. Inactive tabs stay mounted (state preserved).

```tsx
function HomeScreen({ sdk, navigation }) {
  const colors = sdk.theme.colors;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={{ color: colors.foreground }}>Home</Text>
      <Pressable onPress={() => navigation.navigate("settings")}>
        <Text style={{ color: colors.primary }}>Go to Settings</Text>
      </Pressable>
    </View>
  );
}

function SettingsScreen({ sdk }) {
  return (
    <View style={{ flex: 1, backgroundColor: sdk.theme.colors.background }}>
      <Text style={{ color: sdk.theme.colors.foreground }}>Settings</Text>
    </View>
  );
}

export default function MyApp() {
  const sdk = usePlotpaperSDK();
  const tabs = [
    { key: "home", title: "Home", icon: "home", screen: HomeScreen },
    { key: "settings", title: "Settings", icon: "settings", screen: SettingsScreen },
  ];
  return <TabNavigator tabs={tabs} theme={sdk.theme} sdk={sdk} />;
}
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tabs` | `TabConfig[]` | Yes | | Array of tab configurations |
| `theme` | `SDKTheme` | Yes | | `sdk.theme` object |
| `sdk` | any | No | | Passed to each screen as props |
| `initialTab` | string | No | First tab | Key of the initial tab |
| `showLabels` | boolean | No | `true` | Show tab titles |

### TabConfig

```ts
{ key: string, title: string, icon: string, screen: Component, badge?: string | number }
```

Each screen receives: `{ sdk, navigation: { navigate(key), currentTab } }`

**Important:** TabNavigator is a floating pill at the bottom. Add `paddingBottom: 100` to scroll areas so content isn't hidden behind it.

## StackNavigator

Push/pop navigation with a header bar.

```tsx
function ListScreen({ sdk, navigation }) {
  const items = ["Apple", "Banana", "Cherry"];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: sdk.theme.colors.background }}>
      {items.map((item, i) => (
        <Pressable key={i} onPress={() => navigation.push("detail", { item })}>
          <Text style={{ color: sdk.theme.colors.foreground }}>{item}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function DetailScreen({ sdk, route }) {
  const item = route.params?.item ?? "Unknown";
  return (
    <View style={{ flex: 1, backgroundColor: sdk.theme.colors.background }}>
      <Text style={{ color: sdk.theme.colors.foreground, fontSize: 24 }}>{item}</Text>
    </View>
  );
}

export default function MyApp() {
  const sdk = usePlotpaperSDK();
  const screens = {
    list: { title: "Items", screen: ListScreen },
    detail: { title: "Detail", screen: DetailScreen },
  };
  return <StackNavigator screens={screens} initialScreen="list" theme={sdk.theme} sdk={sdk} />;
}
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `screens` | `Record<string, ScreenConfig>` | Yes | | Screen name → config mapping |
| `initialScreen` | string | Yes | | Name of the first screen |
| `theme` | `SDKTheme` | Yes | | `sdk.theme` object |
| `sdk` | any | No | | Passed to each screen as props |
| `showHeader` | boolean | No | `true` | Show/hide the header bar |

Each screen receives: `{ sdk, navigation: { push, pop, popToRoot, canGoBack }, route: { name, params } }`

## Nested Navigation

Combine tabs with stacks:

```tsx
function BrowseTab({ sdk }) {
  const screens = {
    browse: { title: "Browse", screen: BrowseList },
    detail: { title: "Detail", screen: DetailScreen },
  };
  return <StackNavigator screens={screens} initialScreen="browse" theme={sdk.theme} sdk={sdk} showHeader />;
}

export default function MyApp() {
  const sdk = usePlotpaperSDK();
  const tabs = [
    { key: "browse", title: "Browse", icon: "search", screen: BrowseTab },
    { key: "profile", title: "Profile", icon: "user", screen: ProfileScreen },
  ];
  return <TabNavigator tabs={tabs} theme={sdk.theme} sdk={sdk} />;
}
```
