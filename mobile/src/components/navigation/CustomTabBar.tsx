/**
 * CustomTabBar -- Airbnb-style animated bottom tab bar
 *
 * Features:
 * - Active icon scales up (1 -> 1.15) with spring animation
 * - Label only shown for the active tab (fades in/out)
 * - Small dot indicator below active icon that slides between tabs
 * - Haptic feedback (Light) on tab switch
 * - Uses Reanimated for all animations
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Platform } from 'react-native';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS } from '../../utils/constants';
import { SPRING } from '../../utils/animations';

const TAB_BAR_HEIGHT = 60;
const DOT_SIZE = 5;

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors } = useTheme();

  // Shared values for the sliding dot
  const tabWidths = React.useRef<number[]>([]);
  const tabPositions = React.useRef<number[]>([]);
  const dotTranslateX = useSharedValue(0);

  // Update dot position when active index changes
  useEffect(() => {
    if (tabPositions.current.length > state.index) {
      const tabCenter =
        tabPositions.current[state.index] +
        (tabWidths.current[state.index] || 0) / 2 -
        DOT_SIZE / 2;
      dotTranslateX.value = withSpring(tabCenter, SPRING.snappy);
    }
  }, [state.index]);

  const handleTabLayout = useCallback(
    (index: number) => (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      tabWidths.current[index] = width;
      tabPositions.current[index] = x;

      // Set initial dot position without animation
      if (index === state.index) {
        const tabCenter = x + width / 2 - DOT_SIZE / 2;
        dotTranslateX.value = tabCenter;
      }
    },
    [state.index],
  );

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dotTranslateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              options={options}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              onLayout={handleTabLayout(index)}
              activeColor={colors.primary}
              badge={options.tabBarBadge}
              badgeStyle={options.tabBarBadgeStyle}
            />
          );
        })}
      </View>

      {/* Sliding dot indicator */}
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: colors.primary },
          dotStyle,
        ]}
      />
    </View>
  );
};

// -----------------------------------------------------------------------

interface TabItemProps {
  options: any;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
  activeColor: string;
  badge?: number | string;
  badgeStyle?: any;
}

const TabItem: React.FC<TabItemProps> = React.memo(
  ({
    options,
    isFocused,
    onPress,
    onLongPress,
    onLayout,
    activeColor,
    badge,
    badgeStyle,
  }) => {
    const iconScale = useSharedValue(isFocused ? 1.15 : 1);
    const labelOpacity = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
      iconScale.value = withSpring(isFocused ? 1.15 : 1, SPRING.snappy);
      labelOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    }, [isFocused]);

    const iconAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: iconScale.value }],
    }));

    const labelAnimatedStyle = useAnimatedStyle(() => ({
      opacity: labelOpacity.value,
      // Collapse height when hidden so layout stays tight
      maxHeight: interpolate(labelOpacity.value, [0, 1], [0, 18]),
      marginTop: interpolate(labelOpacity.value, [0, 1], [0, 2]),
    }));

    const label =
      typeof options.tabBarLabel === 'string'
        ? options.tabBarLabel
        : typeof options.title === 'string'
          ? options.title
          : '';

    const color = isFocused ? activeColor : NEUTRAL_COLORS.gray;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        onLayout={onLayout}
        style={styles.tabItem}
      >
        <Animated.View style={iconAnimatedStyle}>
          {options.tabBarIcon?.({
            focused: isFocused,
            color,
            size: 24,
          })}
        </Animated.View>

        {/* Badge */}
        {badge !== undefined && badge !== null && (
          <View style={[styles.badge, badgeStyle]}>
            <Animated.Text style={styles.badgeText}>
              {typeof badge === 'number' && badge > 99 ? '99+' : badge}
            </Animated.Text>
          </View>
        )}

        <Animated.Text
          style={[styles.label, { color }, labelAnimatedStyle]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
      </Pressable>
    );
  },
);

// -----------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
    height: TAB_BAR_HEIGHT,
    position: 'relative',
  },
  tabRow: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    bottom: 6,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: '25%',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: NEUTRAL_COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: NEUTRAL_COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default React.memo(CustomTabBar);
