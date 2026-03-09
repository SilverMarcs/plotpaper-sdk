# Available Components

## React Native

Import from `react-native`:

**Layout:** `View`, `ScrollView`, `FlatList`, `SectionList`, `SafeAreaView`
**Text:** `Text`
**Input:** `TextInput`, `Switch`, `Pressable`, `TouchableOpacity`
**Display:** `Image`, `Modal`, `ActivityIndicator`
**Utility:** `StyleSheet`, `Dimensions`, `Alert`, `Animated`, `Platform`, `KeyboardAvoidingView`

## Feather Icons

```tsx
import Feather from "@expo/vector-icons/Feather";

<Feather name="check" size={24} color={colors.primary} />
```

Props: `name` (string, required), `size` (number, default 24), `color` (string).

<details>
<summary>All available icon names</summary>

check, x, plus, minus, edit-2, trash-2, heart, star, settings, search, home, user, bell, calendar, clock, arrow-left, arrow-right, chevron-down, chevron-up, chevron-right, share, copy, download, upload, refresh-cw, eye, eye-off, lock, unlock, mail, phone, map-pin, camera, image, mic, play, pause, volume-2, wifi, bluetooth, battery, sun, moon, cloud, zap, award, gift, bookmark, flag, tag, folder, file, file-text, grid, list, layers, filter, sliders, bar-chart-2, trending-up, trending-down, activity, target, alert-circle, info, help-circle, check-circle, x-circle, alert-triangle, more-horizontal, more-vertical, menu, external-link, link, rotate-cw, rotate-ccw, save, send, scissors, maximize, minimize, move, circle, square, triangle, octagon, hash, at-sign, percent, dollar-sign, credit-card, shopping-cart, shopping-bag, package, truck, map, compass, navigation, globe, crosshair, wind, droplet, thermometer, umbrella, coffee, book, book-open, feather, pen-tool, type, bold, italic, underline, align-left, align-center, align-right, columns, sidebar, layout, monitor, smartphone, tablet, watch, tv, speaker, headphones, radio, film, video, aperture, log-in, log-out, power, repeat, skip-back, skip-forward, rewind, fast-forward, voicemail, inbox, archive, paperclip, printer, server, database, hard-drive, cpu, terminal, code, git-branch, git-commit, git-merge, git-pull-request, github, gitlab, chrome, figma, codepen, codesandbox, slack, twitter, facebook, instagram, linkedin, youtube, twitch, airplay, cast

</details>

## SVG Graphics

```tsx
import Svg, { Circle, Rect, Path, Line, Text as SvgText, G, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
```

Available elements: `Svg`, `Circle`, `Rect`, `Ellipse`, `Line`, `Polyline`, `Polygon`, `Path`, `Text` (as `SvgText`), `TSpan`, `G`, `Defs`, `Use`, `ClipPath`, `LinearGradient` (as `SvgLinearGradient`), `RadialGradient`, `Stop`, `Mask`, `Pattern`

**Important:** Alias SVG `Text` to avoid conflict with React Native `Text`:

```tsx
import { Text as SvgText } from "react-native-svg";
```

### Progress ring example

```tsx
<Svg width={120} height={120} viewBox="0 0 120 120">
  <Circle cx={60} cy={60} r={50} fill="none" stroke={colors.muted} strokeWidth={8} />
  <Circle
    cx={60} cy={60} r={50} fill="none"
    stroke={colors.primary} strokeWidth={8}
    strokeDasharray={2 * Math.PI * 50}
    strokeDashoffset={2 * Math.PI * 50 * (1 - progress)}
    strokeLinecap="round"
    transform="rotate(-90 60 60)"
  />
</Svg>
```

## Safe Area

```tsx
import { useSafeAreaInsets } from "react-native-safe-area-context";

const insets = useSafeAreaInsets();
// { top, bottom, left, right } in points
```

The mini-app shell handles the top safe area. Use `useSafeAreaInsets()` mainly for bottom padding with fixed bottom UI.

Also available: `SafeAreaView` with `edges` and `mode` props.
