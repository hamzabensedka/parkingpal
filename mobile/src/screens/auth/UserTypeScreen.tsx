import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { RENTER_COLORS, HOST_COLORS, NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../utils/constants';
import { AuthStackParamList, UserType } from '../../types';
import { Button } from '../../components/common';

type UserTypeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'UserType'>;

interface UserTypeScreenProps {
  navigation: UserTypeScreenNavigationProp;
}

interface UserTypeOption {
  type: UserType;
  title: string;
  description: string;
  icon: string;
  colors: typeof RENTER_COLORS | typeof HOST_COLORS;
  benefits: string[];
}

const userTypeOptions: UserTypeOption[] = [
  {
    type: 'renter',
    title: 'I need parking',
    description: 'Find and book parking spots near your destination',
    icon: 'car-search',
    colors: RENTER_COLORS,
    benefits: [
      'Search thousands of parking spots',
      'Book instantly or reserve ahead',
      'Save money vs public parking',
      'Get directions to your spot',
    ],
  },
  {
    type: 'host',
    title: 'I have a spot',
    description: 'Earn money by renting out your parking space',
    icon: 'home-city',
    colors: HOST_COLORS,
    benefits: [
      'Earn passive income',
      'Set your own prices',
      'Control your availability',
      'Automated payments',
    ],
  },
];

const UserTypeScreen: React.FC<UserTypeScreenProps> = ({ navigation }) => {
  const { setUserType } = useAuth();
  const { setUserType: setThemeUserType } = useTheme();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectType = async (type: UserType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedType(type);
  };

  const handleContinue = async () => {
    if (!selectedType) return;

    setIsLoading(true);
    try {
      await setUserType(selectedType);
      await setThemeUserType(selectedType);
      navigation.navigate('IDVerification');
    } catch (error) {
      console.error('Error setting user type:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderOption = (option: UserTypeOption) => {
    const isSelected = selectedType === option.type;
    const borderColor = isSelected ? option.colors.primary : NEUTRAL_COLORS.lightGray;
    const backgroundColor = isSelected ? option.colors.lightest : NEUTRAL_COLORS.white;

    return (
      <TouchableOpacity
        key={option.type}
        style={[
          styles.optionCard,
          {
            borderColor,
            backgroundColor,
          },
          isSelected && SHADOWS.medium,
        ]}
        onPress={() => handleSelectType(option.type)}
        activeOpacity={0.9}
      >
        <View style={styles.optionHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: option.colors.light },
            ]}
          >
            <Icon name={option.icon} size={32} color={option.colors.dark} />
          </View>
          <View style={styles.optionTitleContainer}>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionDescription}>{option.description}</Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              { borderColor: isSelected ? option.colors.primary : NEUTRAL_COLORS.gray },
            ]}
          >
            {isSelected && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: option.colors.primary },
                ]}
              />
            )}
          </View>
        </View>

        {isSelected && (
          <View style={styles.benefitsList}>
            {option.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon
                  name="check-circle"
                  size={16}
                  color={option.colors.primary}
                />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={NEUTRAL_COLORS.black} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How will you use ParkingPal?</Text>
          <Text style={styles.subtitle}>
            You can change this later or use both features
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {userTypeOptions.map(renderOption)}
        </View>

        {/* Both Option */}
        <TouchableOpacity
          style={styles.bothOption}
          onPress={() => handleSelectType('both')}
        >
          <Icon
            name={selectedType === 'both' ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={selectedType === 'both' ? RENTER_COLORS.primary : NEUTRAL_COLORS.gray}
          />
          <Text style={styles.bothOptionText}>I want to do both</Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedType}
            loading={isLoading}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  options: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  optionCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionTitleContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  benefitsList: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  benefitText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  bothOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  bothOptionText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.black,
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: SPACING.lg,
  },
});

export default UserTypeScreen;
