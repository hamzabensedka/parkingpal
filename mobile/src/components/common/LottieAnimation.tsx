/**
 * LottieAnimation — thin wrapper around lottie-react-native
 *
 * Centralizes all Lottie asset imports and provides a consistent API.
 * Usage: <LottieAnimation name="success-check" size={160} />
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

// Centralized asset registry — add new animations here
const LOTTIE_SOURCES = {
  'splash-parking': require('../../../assets/lottie/splash-parking.json'),
  'loading-spinner': require('../../../assets/lottie/loading-spinner.json'),
  'empty-inbox': require('../../../assets/lottie/empty-inbox.json'),
  'empty-map': require('../../../assets/lottie/empty-map.json'),
  'success-check': require('../../../assets/lottie/success-check.json'),
  'error-warning': require('../../../assets/lottie/error-warning.json'),
  'onboarding-find': require('../../../assets/lottie/onboarding-find.json'),
  'onboarding-book': require('../../../assets/lottie/onboarding-book.json'),
  'onboarding-earn': require('../../../assets/lottie/onboarding-earn.json'),
  'pull-refresh': require('../../../assets/lottie/pull-refresh.json'),
  'confetti': require('../../../assets/lottie/confetti.json'),
  'typing-dots': require('../../../assets/lottie/typing-dots.json'),
} as const;

export type LottieName = keyof typeof LOTTIE_SOURCES;

interface LottieAnimationProps {
  name: LottieName;
  size?: number;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: ViewStyle;
  onAnimationFinish?: () => void;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  name,
  size = 120,
  autoPlay = true,
  loop = false,
  speed = 1,
  style,
  onAnimationFinish,
}) => {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay) {
      lottieRef.current?.play();
    }
  }, [autoPlay]);

  const handleFinish = useCallback(() => {
    onAnimationFinish?.();
  }, [onAnimationFinish]);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <LottieView
        ref={lottieRef}
        source={LOTTIE_SOURCES[name]}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={styles.lottie}
        onAnimationFinish={handleFinish}
        renderMode="AUTOMATIC"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  lottie: {
    width: '100%',
    height: '100%',
  },
});

export default React.memo(LottieAnimation);
