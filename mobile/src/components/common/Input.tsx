import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, NEUTRAL_COLORS } from '../../utils/constants';

type InputType = 'text' | 'email' | 'password' | 'phone' | 'number';

interface InputProps extends Omit<TextInputProps, 'onChangeText'> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  type?: InputType;
  multiline?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  editable?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  type = 'text',
  multiline = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  editable = true,
  containerStyle,
  required = false,
  ...rest
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animated border color transition
  const borderProgress = useSharedValue(0); // 0 = idle, 1 = focused, 2 = error
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (error) {
      borderProgress.value = withTiming(2, { duration: 200 });
      // Trigger shake
      shakeX.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    } else if (isFocused) {
      borderProgress.value = withTiming(1, { duration: 200 });
    } else {
      borderProgress.value = withTiming(0, { duration: 200 });
    }
  }, [error, isFocused]);

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      borderProgress.value,
      [0, 1, 2],
      [NEUTRAL_COLORS.lightGray, colors.primary, '#000000']
    );
    return { borderColor };
  });

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const getKeyboardType = useCallback((): TextInputProps['keyboardType'] => {
    switch (type) {
      case 'email': return 'email-address';
      case 'phone': return 'phone-pad';
      case 'number': return 'numeric';
      default: return 'default';
    }
  }, [type]);

  const getAutoCapitalize = useCallback((): TextInputProps['autoCapitalize'] => {
    switch (type) {
      case 'email':
      case 'password': return 'none';
      default: return 'sentences';
    }
  }, [type]);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const isPassword = type === 'password';
  const secureTextEntry = isPassword && !showPassword;
  const backgroundColor = !editable ? NEUTRAL_COLORS.background : NEUTRAL_COLORS.white;
  const iconColor = isFocused ? colors.primary : NEUTRAL_COLORS.gray;

  return (
    <AnimatedView style={[styles.container, animatedShakeStyle, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: NEUTRAL_COLORS.black }]}>
          {label}
          {required && <Text style={{ color: NEUTRAL_COLORS.error }}> *</Text>}
        </Text>
      )}
      <AnimatedView
        style={[
          styles.inputContainer,
          { backgroundColor },
          multiline && styles.multilineContainer,
          animatedBorderStyle,
        ]}
      >
        {leftIcon && (
          <Icon name={leftIcon} size={20} color={iconColor} style={styles.leftIcon} />
        )}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: NEUTRAL_COLORS.black },
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
            multiline && styles.multilineInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={NEUTRAL_COLORS.gray}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          autoCorrect={type === 'text'}
          editable={editable}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          blurOnSubmit={!multiline}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={handleTogglePassword}
            style={styles.rightIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={NEUTRAL_COLORS.gray} />
          </TouchableOpacity>
        )}
        {!isPassword && rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name={rightIcon} size={20} color={NEUTRAL_COLORS.gray} />
          </TouchableOpacity>
        )}
      </AnimatedView>
      {error && (
        <View style={styles.errorRow}>
          <Icon name="alert-circle" size={14} color={NEUTRAL_COLORS.error} />
          <Text style={[styles.errorText, { color: NEUTRAL_COLORS.error }]}>{error}</Text>
        </View>
      )}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    minHeight: 50,
    paddingHorizontal: SPACING.md,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    minHeight: 100,
    paddingVertical: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    paddingVertical: SPACING.sm,
  },
  inputWithLeftIcon: {
    marginLeft: SPACING.sm,
  },
  inputWithRightIcon: {
    marginRight: SPACING.sm,
  },
  multilineInput: {
    minHeight: 80,
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    padding: SPACING.xs,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginLeft: SPACING.xs,
  },
});

export default Input;
