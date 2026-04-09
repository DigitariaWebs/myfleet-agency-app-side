import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { fontFamilies } from '@/theme/typography';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TabItem {
  name: string;
  label: string;
  icon: LucideIcon;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (name: string) => void;
}

// ── Single Tab ───────────────────────────────────────────────────────────────

interface TabButtonProps {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ tab, isActive, onPress }: TabButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const dotOpacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    if (isActive) {
      scale.value = withSequence(
        withSpring(1.12, { damping: 12, stiffness: 300 }),
        withSpring(1.0, { damping: 14, stiffness: 280 }),
      );
      dotOpacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(1.0, { duration: 150 });
      dotOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [isActive, scale, dotOpacity]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const Icon = tab.icon;
  const iconColor = isActive ? theme.navBarActive : theme.navBarInactive;

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Active dot */}
      <Animated.View
        style={[
          dotStyle,
          {
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: theme.navBarActive,
            marginBottom: 3,
          },
        ]}
      />

      {/* Icon */}
      <Animated.View style={iconStyle}>
        <Icon
          size={22}
          color={iconColor}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
      </Animated.View>

      {/* Label */}
      <Animated.Text
        style={{
          fontFamily: isActive ? fontFamilies.medium : fontFamilies.regular,
          fontSize: 9,
          color: iconColor,
          marginTop: 2,
        }}
        numberOfLines={1}
      >
        {tab.label}
      </Animated.Text>
    </Pressable>
  );
}

// ── Tab Bar ──────────────────────────────────────────────────────────────────

const TAB_HEIGHT = 56;

export function TabBar({ tabs, activeTab, onTabPress }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom - 8, 0);

  return (
    <View
      style={{
        backgroundColor: theme.navBar,
        paddingBottom: bottomPad,
      }}
    >
      <View
        style={{
          height: TAB_HEIGHT,
          flexDirection: 'row',
        }}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.name}
            tab={tab}
            isActive={activeTab === tab.name}
            onPress={() => onTabPress(tab.name)}
          />
        ))}
      </View>
    </View>
  );
}
