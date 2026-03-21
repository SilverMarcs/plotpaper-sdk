# Available Components

## React Native

Import from `react-native`:

**Layout:** `View`, `ScrollView`, `FlatList`, `SectionList`, `SafeAreaView`
**Text:** `Text`
**Input:** `TextInput`, `Switch`, `Pressable`, `TouchableOpacity`
**Display:** `Image`, `Modal`, `ActivityIndicator`
**Utility:** `StyleSheet`, `Dimensions`, `Alert`, `Animated`, `Platform`, `KeyboardAvoidingView`

## Lucide Icons

```tsx
import { Check, Plus, Trash2, ArrowLeft } from "lucide-react-native";

<Check size={24} color={colors.primary} />
<Plus size={20} color={colors.primaryForeground} />
<Trash2 size={18} color={colors.destructive} strokeWidth={1.5} />
```

Props: `size` (number, default 24), `color` (string), `strokeWidth` (number, default 2).

Icons are imported as individual components from `lucide-react-native`. Browse all icons at [lucide.dev/icons](https://lucide.dev/icons).

## Plotpaper UI Components

Pre-styled components from `@plotpaper/ui` — built with Tailwind, themed automatically:

```tsx
import { Text, Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Icon } from "@plotpaper/ui";
```

**Typography:** `Text`
**Buttons:** `Button`
**Cards:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
**Form inputs:** `Input`, `Textarea`, `Label`, `Checkbox`, `Switch`, `RadioGroup`, `RadioGroupItem`
**Data display:** `Badge`, `Avatar`, `AvatarImage`, `AvatarFallback`, `Separator`, `Progress`, `Skeleton`
**Layout:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
**Feedback:** `Alert`, `AlertTitle`, `AlertDescription`, `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`
**Icons:** `Icon` — wrapper for Lucide icons with Tailwind `className` support
**Layout:** `SafeAreaView`

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
