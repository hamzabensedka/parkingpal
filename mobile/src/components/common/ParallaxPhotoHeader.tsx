/**
 * ParallaxPhotoHeader — Airbnb-style parallax photo gallery header
 *
 * Uses Reanimated scroll-driven parallax (0.5x ratio) + overscroll zoom.
 * Renders a horizontal paged gallery with dot indicators and overlay action buttons.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NEUTRAL_COLORS, SPACING, SHADOWS } from '../../utils/constants';
import AnimatedPressable from './AnimatedPressable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_HEIGHT = 300;

interface ParallaxPhotoHeaderProps {
  photos: string[];
  scrollY: SharedValue<number>;
  height?: number;
  onBack?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

const ParallaxPhotoHeader: React.FC<ParallaxPhotoHeaderProps> = ({
  photos,
  scrollY,
  height = DEFAULT_HEIGHT,
  onBack,
  onShare,
  onSave,
  isSaved = false,
}) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Parallax: image translates at 0.5x speed, scales on overscroll
  const parallaxStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-height, 0, height],
      [-height * 0.5, 0, height * 0.5]
    );
    const scale = interpolate(
      scrollY.value,
      [-height, 0],
      [2, 1],
      'clamp'
    );
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Header buttons fade in from transparent bg to solid as you scroll
  const headerBgStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, height * 0.6],
      [0, 1],
      'clamp'
    );
    return {
      backgroundColor: `rgba(255,255,255,${opacity})`,
    };
  });

  return (
    <View style={[styles.container, { height }]}>
      {/* Parallax image layer */}
      <Animated.View style={[styles.imageLayer, { height: height * 1.3 }, parallaxStyle]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(idx);
          }}
        >
          {photos.length > 0 ? (
            photos.map((photo, index) => (
              <View key={index} style={[styles.photoSlide, { width: SCREEN_WIDTH, height }]}>
                {photo.startsWith('http') ? (
                  <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
                ) : (
                  <View style={[styles.photoPlaceholder, { height }]}>
                    <Icon name="image" size={48} color={NEUTRAL_COLORS.gray} />
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={[styles.photoPlaceholder, { width: SCREEN_WIDTH, height }]}>
              <Icon name="image" size={48} color={NEUTRAL_COLORS.gray} />
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Photo indicators */}
      {photos.length > 1 && (
        <View style={styles.indicators}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Photo count badge */}
      {photos.length > 1 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {currentIndex + 1}/{photos.length}
          </Text>
        </View>
      )}

      {/* Overlay header buttons */}
      <Animated.View style={[styles.headerRow, { top: insets.top + SPACING.xs }, headerBgStyle]}>
        {onBack && (
          <AnimatedPressable style={styles.headerBtn} onPress={onBack} haptic>
            <Icon name="arrow-left" size={22} color={NEUTRAL_COLORS.black} />
          </AnimatedPressable>
        )}
        <View style={styles.headerRight}>
          {onShare && (
            <AnimatedPressable style={styles.headerBtn} onPress={onShare} haptic>
              <Icon name="share-variant" size={22} color={NEUTRAL_COLORS.black} />
            </AnimatedPressable>
          )}
          {onSave && (
            <AnimatedPressable style={styles.headerBtn} onPress={onSave} haptic>
              <Icon
                name={isSaved ? 'heart' : 'heart-outline'}
                size={22}
                color={isSaved ? '#FF385C' : NEUTRAL_COLORS.black}
              />
            </AnimatedPressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: NEUTRAL_COLORS.lightGray,
  },
  imageLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  photoSlide: {
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NEUTRAL_COLORS.lightGray,
  },
  indicators: {
    position: 'absolute',
    bottom: SPACING.md,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: NEUTRAL_COLORS.white,
    width: 18,
  },
  countBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: NEUTRAL_COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  headerRow: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    borderRadius: 16,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NEUTRAL_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});

export default ParallaxPhotoHeader;
