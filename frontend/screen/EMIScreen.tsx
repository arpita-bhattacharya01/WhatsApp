import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface EMIItem {
  id: string;
  loanName: string;
  lender: string;
  amount: string;
  dueDate: string;
  frequency: string;
  reminderDaysBefore?: number;
}

export default function EMIScreen() {
  const [emis, setEmis] = useState<EMIItem[]>([]);
  const [newEmi, setNewEmi] = useState<Omit<EMIItem, 'id'> & { reminderDaysBefore: number }>({
    loanName: '',
    lender: '',
    amount: '',
    dueDate: '',
    frequency: 'monthly',
    reminderDaysBefore: 1
  });
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockEmis: EMIItem[] = [
      {
        id: '1',
        loanName: 'Car Loan',
        lender: 'ABC Bank',
        amount: '15,000',
        dueDate: '2023-12-05',
        frequency: 'monthly'
      },
      {
        id: '2',
        loanName: 'Home Loan',
        lender: 'XYZ Bank',
        amount: '45,000',
        dueDate: '2023-12-10',
        frequency: 'monthly'
      }
    ];
    setEmis(mockEmis);
  }, []);

  const addEMI = () => {
    const newEmiItem: EMIItem = {
      id: Date.now().toString(),
      ...newEmi
    };
    setEmis([...emis, newEmiItem]);
    setIsAdding(false);
    setNewEmi({
      loanName: '',
      lender: '',
      amount: '',
      dueDate: '',
      frequency: 'monthly',
      reminderDaysBefore: 1
    });
  };

  const deleteEMI = (id: string) => {
    setEmis(emis.filter(emi => emi.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.title}>EMI Reminders</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
          <Ionicons name={isAdding ? "close" : "add"} size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isAdding && (
          <View style={styles.addForm}>
            <Text style={styles.formLabel}>Loan Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Car Loan"
              value={newEmi.loanName}
              onChangeText={(text) => setNewEmi({...newEmi, loanName: text})}
            />

            <Text style={styles.formLabel}>Lender/Bank</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., State Bank"
              value={newEmi.lender}
              onChangeText={(text) => setNewEmi({...newEmi, lender: text})}
            />

            <Text style={styles.formLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 15000"
              keyboardType="numeric"
              value={newEmi.amount}
              onChangeText={(text) => setNewEmi({...newEmi, amount: text})}
            />

            <Text style={styles.formLabel}>Due Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={newEmi.dueDate}
              onChangeText={(text) => setNewEmi({...newEmi, dueDate: text})}
            />

            <TouchableOpacity style={styles.addButton} onPress={addEMI}>
              <Text style={styles.addButtonText}>Add EMI Reminder</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Your EMI Reminders</Text>
        
        {emis.length === 0 ? (
          <Text style={styles.emptyText}>No EMI reminders added yet</Text>
        ) : (
          <FlatList
            data={emis}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.emiItem}>
                <View style={styles.emiIcon}>
                  <Ionicons name="calendar" size={20} color="#4F46E5" />
                </View>
                <View style={styles.emiDetails}>
                  <Text style={styles.emiName}>{item.loanName}</Text>
                  <Text style={styles.emiLender}>{item.lender}</Text>
                  <Text style={styles.emiAmount}>₹{item.amount}</Text>
                  <Text style={styles.emiDate}>
                    Due on {new Date(item.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteEMI(item.id)}
                >
                  <Ionicons name="trash" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1d29',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3340',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addForm: {
    backgroundColor: '#1f232e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  formLabel: {
    color: '#a1a1aa',
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#2d3340',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 40,
  },
  emiItem: {
    backgroundColor: '#1f232e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emiIcon: {
    backgroundColor: '#2d3340',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emiDetails: {
    flex: 1,
  },
  emiName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emiLender: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 4,
  },
  emiAmount: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emiDate: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
});