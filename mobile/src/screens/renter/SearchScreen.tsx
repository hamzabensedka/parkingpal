import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { searchPlaces, Place } from '../../services/osmService';
import { AnimatedPressable } from '../../components/common';

interface SearchSuggestion {
  id: string;
  title: string;
  subtitle: string;
  type: 'recent' | 'popular' | 'place';
  coordinates?: { latitude: number; longitude: number };
}

const recentSearches: SearchSuggestion[] = [
  { id: '1', title: 'Louvre Museum', subtitle: 'Paris, France', type: 'recent' },
  { id: '2', title: 'Eiffel Tower', subtitle: 'Paris, France', type: 'recent' },
];

const popularPlaces: SearchSuggestion[] = [
  { id: '3', title: 'Stade de France', subtitle: 'Saint-Denis', type: 'popular' },
  { id: '4', title: 'Parc des Princes', subtitle: 'Paris 16e', type: 'popular' },
  { id: '5', title: 'Opera Garnier', subtitle: 'Paris 9e', type: 'popular' },
  { id: '6', title: 'Galeries Lafayette', subtitle: 'Paris 9e', type: 'popular' },
];

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get user location for biasing search results
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const places = await searchPlaces(query, userLocation || undefined);
    setSearchResults(
      places.map((place: Place, index: number) => ({
        id: `search-${index}`,
        title: place.name,
        subtitle: place.description,
        type: 'place' as const,
        coordinates: place.coordinates,
      }))
    );
    setIsSearching(false);
  }, [userLocation]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(text);
    }, 300);
  }, [performSearch]);

  const handleSelectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    const coords = suggestion.coordinates || { latitude: 48.8566, longitude: 2.3522 };
    navigation.navigate('SearchResults', {
      filters: {
        location: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: suggestion.title,
        },
      },
    });
  }, [navigation]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <AnimatedPressable
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item)}
      haptic
    >
      <View style={[styles.suggestionIcon, { backgroundColor: colors.lightest }]}>
        <Icon
          name={item.type === 'recent' ? 'history' : item.type === 'place' ? 'map-marker' : 'map-marker'}
          size={20}
          color={colors.primary}
        />
      </View>
      <View style={styles.suggestionText}>
        <Text style={styles.suggestionTitle}>{item.title}</Text>
        <Text style={styles.suggestionSubtitle}>{item.subtitle}</Text>
      </View>
      <Icon name="arrow-top-left" size={20} color={NEUTRAL_COLORS.gray} />
    </AnimatedPressable>
  );

  const showAutocompleteResults = searchQuery.length >= 3 && (searchResults.length > 0 || isSearching);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Input */}
      <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
        <View style={styles.searchContainer}>
          <AnimatedPressable onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={NEUTRAL_COLORS.black} />
          </AnimatedPressable>
          <View style={styles.inputContainer}>
            <Icon name="magnify" size={20} color={NEUTRAL_COLORS.gray} />
            <TextInput
              style={styles.input}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search for a place or address"
              placeholderTextColor={NEUTRAL_COLORS.gray}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <AnimatedPressable onPress={handleClear}>
                <Icon name="close-circle" size={20} color={NEUTRAL_COLORS.gray} />
              </AnimatedPressable>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Loading indicator */}
      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {/* Autocomplete Results */}
      {showAutocompleteResults && !isSearching && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            data={searchResults}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Recent Searches (shown when no active search) */}
      {!showAutocompleteResults && !isSearching && recentSearches.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <AnimatedPressable>
                <Text style={[styles.clearLink, { color: colors.primary }]}>Clear</Text>
              </AnimatedPressable>
            </View>
            <FlatList
              data={recentSearches}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </Animated.View>
      )}

      {/* Popular Places (shown when no active search) */}
      {!showAutocompleteResults && !isSearching && (
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Places</Text>
            <FlatList
              data={popularPlaces}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
    gap: SPACING.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.black,
    marginLeft: SPACING.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
  },
  suggestionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
});

export default SearchScreen;
