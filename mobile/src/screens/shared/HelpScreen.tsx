import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Card, Input, AnimatedPressable } from '../../components/common';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'How do I book a parking spot?',
    answer: 'Search for parking near your destination using the map or search function. Select a spot, choose your dates and times, select your vehicle, and confirm payment to complete your booking.',
    category: 'Booking',
  },
  {
    id: '2',
    question: 'How do I cancel a booking?',
    answer: 'Go to your Bookings tab, select the booking you want to cancel, and tap "Cancel Booking". Free cancellation is available up to 24 hours before the booking starts. A 50% refund applies for cancellations 1-24 hours before.',
    category: 'Booking',
  },
  {
    id: '3',
    question: 'How do I list my parking space?',
    answer: 'Switch to Host mode from your profile, then tap "Add Listing". Follow the steps to add your location, photos, details, and pricing. Once published, renters can find and book your spot.',
    category: 'Hosting',
  },
  {
    id: '4',
    question: 'When do I get paid as a host?',
    answer: 'Payouts are processed automatically every week for completed bookings. Funds are transferred to your linked bank account within 3-5 business days.',
    category: 'Payments',
  },
  {
    id: '5',
    question: 'What if the parking spot doesn\'t match the listing?',
    answer: 'If the spot doesn\'t match the listing description, you can report the issue through the app. We\'ll review your report and may issue a full refund if the claim is valid.',
    category: 'Safety',
  },
  {
    id: '6',
    question: 'How is my payment information secured?',
    answer: 'We use industry-standard encryption and partner with trusted payment processors. Your card details are never stored on our servers.',
    category: 'Safety',
  },
];

const HelpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = FAQ_ITEMS.filter(
    item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(filteredFAQs.map(f => f.category))];

  const handleToggleFAQ = useCallback((id: string) => {
    setExpandedFAQ(prev => prev === id ? null : id);
  }, []);

  const handleContactSupport = useCallback(() => {
    Linking.openURL('mailto:support@parkingpal.com');
  }, []);

  const handleCallSupport = useCallback(() => {
    Linking.openURL('tel:+33123456789');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <Animated.View entering={FadeInDown.delay(0).duration(500).springify()} style={styles.searchSection}>
          <Text style={styles.title}>How can we help?</Text>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for help..."
            leftIcon="magnify"
          />
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={styles.quickActions}>
          <Card style={styles.actionCard} onPress={handleContactSupport}>
            <View style={[styles.actionIcon, { backgroundColor: colors.lightest }]}>
              <Icon name="email" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Email Support</Text>
          </Card>

          <Card style={styles.actionCard} onPress={handleCallSupport}>
            <View style={[styles.actionIcon, { backgroundColor: colors.lightest }]}>
              <Icon name="phone" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Call Us</Text>
          </Card>

          <Card style={styles.actionCard} onPress={() => navigation.navigate('Chat', { conversationId: 'support', recipientName: 'Support' })}>
            <View style={[styles.actionIcon, { backgroundColor: colors.lightest }]}>
              <Icon name="chat" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Live Chat</Text>
          </Card>
        </Animated.View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {categories.map((category) => (
            <View key={category} style={styles.faqCategory}>
              <Text style={[styles.categoryTitle, { color: colors.primary }]}>
                {category}
              </Text>
              {filteredFAQs
                .filter(f => f.category === category)
                .map((faq) => {
                  const isExpanded = expandedFAQ === faq.id;
                  return (
                    <Card key={faq.id} style={styles.faqCard}>
                      <AnimatedPressable
                        style={styles.faqHeader}
                        onPress={() => handleToggleFAQ(faq.id)}
                        haptic
                      >
                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                        <Icon
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={NEUTRAL_COLORS.gray}
                        />
                      </AnimatedPressable>
                      {isExpanded && (
                        <View style={styles.faqAnswer}>
                          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                        </View>
                      )}
                    </Card>
                  );
                })}
            </View>
          ))}

          {filteredFAQs.length === 0 && (
            <View style={styles.noResults}>
              <Icon name="magnify" size={48} color={NEUTRAL_COLORS.lightGray} />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>
                Try a different search or contact support
              </Text>
            </View>
          )}
        </View>

        {/* Contact Card */}
        <Card style={[styles.contactCard, { backgroundColor: colors.lightest }]}>
          <Icon name="headphones" size={32} color={colors.primary} />
          <View style={styles.contactContent}>
            <Text style={[styles.contactTitle, { color: colors.dark }]}>
              Still need help?
            </Text>
            <Text style={styles.contactText}>
              Our support team is available 24/7 to assist you.
            </Text>
          </View>
          <AnimatedPressable
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={handleContactSupport}
            haptic
          >
            <Text style={styles.contactButtonText}>Contact Us</Text>
          </AnimatedPressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  searchSection: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  quickActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: NEUTRAL_COLORS.darkGray,
    textAlign: 'center',
  },
  faqSection: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  faqCategory: {
    marginBottom: SPACING.md,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqCard: {
    marginBottom: SPACING.sm,
    padding: 0,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
    marginRight: SPACING.sm,
  },
  faqAnswer: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
  faqAnswerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 22,
    paddingTop: SPACING.md,
  },
  noResults: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  noResultsText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray,
    marginTop: SPACING.md,
  },
  noResultsSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: SPACING.xs,
  },
  contactCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  contactContent: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  contactTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  contactText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
  },
  contactButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
  },
  contactButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
});

export default HelpScreen;
