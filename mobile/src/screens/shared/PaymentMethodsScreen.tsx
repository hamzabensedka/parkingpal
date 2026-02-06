import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { PaymentMethod } from '../../types';
import { Card, Badge, Button, EmptyState } from '../../components/common';

const SWIPE_THRESHOLD = -80;

interface SwipeableCardProps {
  item: PaymentMethod;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}

const SwipeablePaymentCard: React.FC<SwipeableCardProps> = ({
  item,
  onDelete,
  onSetDefault,
  colors,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -100,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const getCardBrandIcon = (brand?: string): string => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'credit-card';
      case 'mastercard':
        return 'credit-card-outline';
      case 'amex':
        return 'credit-card-multiple';
      default:
        return 'credit-card';
    }
  };

  const getCardBrandColor = (brand?: string): string => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
        return '#006FCF';
      default:
        return NEUTRAL_COLORS.darkGray;
    }
  };

  const formatExpiry = (month?: number, year?: number): string => {
    if (!month || !year) return '';
    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString().slice(-2);
    return `${monthStr}/${yearStr}`;
  };

  return (
    <View style={styles.swipeableContainer}>
      {/* Delete action behind the card */}
      <View style={styles.deleteAction}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
        >
          <Icon name="trash-can-outline" size={24} color={NEUTRAL_COLORS.white} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Card content */}
      <Animated.View
        style={[styles.animatedCard, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Card style={styles.paymentCard} onPress={() => onSetDefault(item.id)}>
          <View style={styles.cardContent}>
            <View
              style={[
                styles.brandIconContainer,
                { backgroundColor: `${getCardBrandColor(item.brand)}15` },
              ]}
            >
              <Icon
                name={getCardBrandIcon(item.brand)}
                size={28}
                color={getCardBrandColor(item.brand)}
              />
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardBrand}>
                  {item.brand || 'Card'}
                </Text>
                {item.isDefault && (
                  <Badge text="Default" variant="primary" size="small" />
                )}
              </View>
              <Text style={styles.cardNumber}>
                **** **** **** {item.last4}
              </Text>
              <Text style={styles.cardExpiry}>
                Expires {formatExpiry(item.expiryMonth, item.expiryYear)}
              </Text>
            </View>

            <Icon
              name="chevron-right"
              size={20}
              color={NEUTRAL_COLORS.gray}
            />
          </View>
        </Card>
      </Animated.View>
    </View>
  );
};

const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { paymentMethods, deletePaymentMethod, setDefaultPaymentMethod } = useAuth();

  const handleAddCard = useCallback(() => {
    navigation.navigate('AddPaymentCard');
  }, [navigation]);

  const handleDelete = useCallback(
    (id: string) => {
      const method = paymentMethods.find((m) => m.id === id);
      if (method?.isDefault) {
        Alert.alert(
          'Cannot Delete',
          'You cannot delete your default payment method. Please set another card as default first.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Delete Payment Method',
        `Are you sure you want to remove the card ending in ${method?.last4}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deletePaymentMethod(id),
          },
        ]
      );
    },
    [paymentMethods, deletePaymentMethod]
  );

  const handleSetDefault = useCallback(
    (id: string) => {
      const method = paymentMethods.find((m) => m.id === id);
      if (method?.isDefault) return;

      Alert.alert(
        'Set as Default',
        `Set the card ending in ${method?.last4} as your default payment method?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Set Default',
            onPress: () => setDefaultPaymentMethod(id),
          },
        ]
      );
    },
    [paymentMethods, setDefaultPaymentMethod]
  );

  const renderPaymentCard = ({ item }: { item: PaymentMethod }) => (
    <SwipeablePaymentCard
      item={item}
      onDelete={handleDelete}
      onSetDefault={handleSetDefault}
      colors={colors}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={[styles.headerCard, { backgroundColor: colors.lightest }]}>
        <Icon name="credit-card-check" size={24} color={colors.primary} />
        <Text style={styles.headerCount}>{paymentMethods.length}</Text>
        <Text style={styles.headerLabel}>
          Saved Card{paymentMethods.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <Text style={styles.swipeHint}>
        <Icon name="gesture-swipe-left" size={14} color={NEUTRAL_COLORS.gray} />{' '}
        Swipe left to delete
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="credit-card-off-outline"
      title="No payment methods"
      description="Add a credit or debit card to start booking parking spots."
      actionLabel="Add Card"
      onAction={handleAddCard}
    />
  );

  const renderFooter = () => (
    <View style={styles.footerInfo}>
      <Icon name="shield-lock-outline" size={16} color={NEUTRAL_COLORS.gray} />
      <Text style={styles.footerInfoText}>
        Your payment information is securely stored and encrypted.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={paymentMethods.length > 0 ? renderHeader : undefined}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={paymentMethods.length > 0 ? renderFooter : undefined}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Card Button */}
      {paymentMethods.length > 0 && (
        <View style={styles.footer}>
          <Button
            title="Add New Card"
            onPress={handleAddCard}
            icon="plus"
            fullWidth
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: SPACING.sm,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  headerCount: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
  },
  headerLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  swipeHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  swipeableContainer: {
    marginBottom: SPACING.md,
    position: 'relative',
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.error,
    borderRadius: RADIUS.lg,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.white,
    fontWeight: '600',
  },
  animatedCard: {
    backgroundColor: NEUTRAL_COLORS.background,
  },
  paymentCard: {
    padding: SPACING.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  cardBrand: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    textTransform: 'capitalize',
  },
  cardNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    fontFamily: 'System',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  footerInfoText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    flex: 1,
  },
});

export default PaymentMethodsScreen;
