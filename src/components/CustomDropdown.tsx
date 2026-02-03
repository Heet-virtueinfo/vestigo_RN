import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from 'react-native';
import Colors from '../constants/theme';

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  data: Option[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  icon?: string;
}

export default function CustomDropdown({
  label,
  data,
  value,
  onSelect,
  placeholder = 'Select an option',
  icon = 'list-outline',
}: CustomDropdownProps) {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);

  const [visible, setVisible] = useState(false);

  const selectedLabel = data.find(item => item.value === value)?.label;

  const handleSelect = (val: string) => {
    onSelect(val);
    setVisible(false);
  };

  const renderItem = ({ item }: { item: Option }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        item.value === value && styles.optionItemActive,
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <Text
        style={[
          styles.optionText,
          item.value === value && styles.optionTextActive,
        ]}
      >
        {item.label}
      </Text>
      {item.value === value && (
        <Ionicons name="checkmark" size={20} color={theme.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={20}
          color={theme.textMuted}
          style={styles.inputIcon}
        />
        <Text
          style={[
            styles.valueText,
            !selectedLabel && { color: theme.textMuted },
          ]}
        >
          {selectedLabel || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.textMuted}
          style={styles.chevronIcon}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.value}
                contentContainerStyle={styles.listContent}
              />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
      marginLeft: 4,
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 50,
    },
    inputIcon: {
      marginRight: 12,
    },
    valueText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    chevronIcon: {
      marginLeft: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 24,
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    listContent: {
      paddingVertical: 8,
    },
    optionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.background, // subtle separator
    },
    optionItemActive: {
      backgroundColor: theme.background,
    },
    optionText: {
      fontSize: 16,
      color: theme.text,
    },
    optionTextActive: {
      color: theme.primary,
      fontWeight: '600',
    },
  });
