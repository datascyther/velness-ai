import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Settings, Bell, Shield, CreditCard, LogOut, ChevronRight, Edit2, Flame, Award, Clock } from 'lucide-react-native';
import { useAppStore } from '@/core/store/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/shared/components/Avatar';
import { Modal } from '@/shared/components/Modal';
import { TextField } from '@/shared/components/TextField';
import { Button } from '@/shared/components/Button';

const menuItems = [
  { icon: Bell, title: 'Notifications', description: 'Manage alerts and reminders', route: 'notifications', color: '#8B5CF6' },
  { icon: Shield, title: 'Privacy & Security', description: 'Terms and data controls', route: 'security', color: '#06B6D4' },
  { icon: CreditCard, title: 'Subscription', description: 'View plan and membership details', route: 'subscription', color: '#A78BFA' },
  { icon: Settings, title: 'Settings', description: 'Theme and configuration preferences', route: 'settings', color: '#22D3EE' },
];

export default function ProfileScreen() {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const user = useAppStore((state) => state.session.user);
  const logout = useAppStore((state) => state.logout);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  const [signingOut, setSigningOut] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const handleOpenEdit = useCallback(() => {
    setEditName(user?.name || '');
    setEditModalVisible(true);
  }, [user]);

  const handleSaveProfile = useCallback(async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Display name cannot be empty.');
      return;
    }
    setUpdatingProfile(true);
    try {
      await updateUserProfile({ name: editName.trim() });
      setEditModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  }, [editName, updateUserProfile]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await logout();
            router.replace('/');
          } catch {
            setSigningOut(false);
          }
        },
      },
    ]);
  }, [logout, router]);

  const streakDays = user?.stats?.streakDays ?? 0;
  const totalSessions = user?.stats?.totalSessions ?? 0;
  const totalMinutes = user?.stats?.totalMinutes ?? 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageHeaderTitle, { color: colors.text.primary }]}>Profile</Text>

        {/* Profile Header */}
        <View style={styles.headerContainer}>
          <View style={styles.avatarWrapper}>
            <Avatar photoURL={user?.photoURL} name={user?.name || 'Guest User'} size="xl" />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenEdit}
              style={[styles.editButtonBadge, { backgroundColor: colors.brand.primary, borderColor: colors.border.default }]}
            >
              <Edit2 size={12} color={colors.brand.contrastText} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text.primary }]}>
            {user?.name || 'Guest User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.text.secondary }]}>
            {user?.email || 'Manage your account'}
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
            <Flame size={20} color="#EF4444" />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{streakDays}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Streak</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
            <Award size={20} color="#8B5CF6" />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{totalSessions}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Sessions</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
            <Clock size={20} color="#06B6D4" />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{totalMinutes}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Minutes</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
          Account & Preferences
        </Text>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/profile/${item.route}` as any)}
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: colors.surface.secondary,
                    borderColor: colors.border.default,
                  }
                ]}
              >
                <View
                  style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}
                >
                  <IconComponent size={20} color={item.color} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuTitle, { color: colors.text.primary }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.menuDescription, { color: colors.text.secondary }]}>
                    {item.description}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.text.secondary} style={styles.chevron} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sign Out Action */}
        <TouchableOpacity
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.7}
          style={[
            styles.signOutButton,
            {
              backgroundColor: colors.surface.secondary,
              borderColor: colors.border.default,
            }
          ]}
        >
          {signingOut ? (
            <ActivityIndicator color={colors.danger} size="small" />
          ) : (
            <>
              <LogOut size={18} color={colors.danger} />
              <Text style={[styles.signOutText, { color: colors.danger }]}>
                Sign Out
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title="Edit Profile"
      >
        <View style={styles.modalContent}>
          <TextField
            label="Display Name"
            placeholder="Enter your name"
            value={editName}
            onChangeText={setEditName}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setEditModalVisible(false)}
              style={styles.modalBtn}
            />
            <Button
              title="Save"
              variant="primary"
              loading={updatingProfile}
              onPress={handleSaveProfile}
              style={styles.modalBtn}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageHeaderTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 10,
    letterSpacing: -0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  editButtonBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.0,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalContent: {
    paddingTop: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalBtn: {
    flex: 1,
  },
});
