import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY } from '../../utils/constants';
import { getInitials } from '../../utils/formatting';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  uri?: string;
  firstName?: string;
  lastName?: string;
  size?: AvatarSize;
  showBadge?: boolean;
  badgeIcon?: string;
  badgeColor?: string;
  style?: ViewStyle;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  firstName,
  lastName,
  size = 'medium',
  showBadge = false,
  badgeIcon = 'check-decagram',
  badgeColor,
  style,
}) => {
  const { colors } = useTheme();

  const getSizeValues = (): { container: number; fontSize: number; badge: number } => {
    switch (size) {
      case 'small':
        return { container: 32, fontSize: TYPOGRAPHY.fontSize.xs, badge: 12 };
      case 'medium':
        return { container: 48, fontSize: TYPOGRAPHY.fontSize.base, badge: 16 };
      case 'large':
        return { container: 64, fontSize: TYPOGRAPHY.fontSize.xl, badge: 20 };
      case 'xlarge':
        return { container: 96, fontSize: TYPOGRAPHY.fontSize['3xl'], badge: 28 };
      default:
        return { container: 48, fontSize: TYPOGRAPHY.fontSize.base, badge: 16 };
    }
  };

  const sizeValues = getSizeValues();
  const initials = firstName && lastName ? getInitials(firstName, lastName) : '';
  const effectiveBadgeColor = badgeColor || colors.primary;

  const containerStyle: ViewStyle = {
    width: sizeValues.container,
    height: sizeValues.container,
    borderRadius: sizeValues.container / 2,
  };

  const imageStyle: ImageStyle = {
    width: sizeValues.container,
    height: sizeValues.container,
    borderRadius: sizeValues.container / 2,
  };

  const renderContent = () => {
    if (uri) {
      return <Image source={{ uri }} style={imageStyle} />;
    }

    if (initials) {
      return (
        <View
          style={[
            styles.initialsContainer,
            containerStyle,
            { backgroundColor: colors.light },
          ]}
        >
          <Text
            style={[
              styles.initials,
              { fontSize: sizeValues.fontSize, color: colors.dark },
            ]}
          >
            {initials}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.placeholderContainer,
          containerStyle,
          { backgroundColor: NEUTRAL_COLORS.lightGray },
        ]}
      >
        <Icon
          name="account"
          size={sizeValues.container * 0.6}
          color={NEUTRAL_COLORS.gray}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderContent()}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: sizeValues.badge,
              height: sizeValues.badge,
              borderRadius: sizeValues.badge / 2,
              backgroundColor: NEUTRAL_COLORS.white,
              right: -2,
              bottom: -2,
            },
          ]}
        >
          <Icon
            name={badgeIcon}
            size={sizeValues.badge - 2}
            color={effectiveBadgeColor}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Avatar;
