import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, Crown, Check, Star, Sparkles } from 'lucide-react-native';
import { features } from '@/core/config/features';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Star,
    color: '#22D3EE',
    features: [
      'Basic mood tracking',
      'Limited AI chat (10/day)',
      'Join up to 3 groups',
      'Standard exercises',
    ],
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    icon: Sparkles,
    color: '#8B5CF6',
    popular: true,
    features: [
      'Unlimited mood tracking',
      'Unlimited AI chat',
      'Unlimited group access',
      'All exercises & tools',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    name: 'Lifetime',
    price: '$49.99',
    period: 'one-time',
    icon: Crown,
    color: '#F59E0B',
    features: [
      'Everything in Premium',
      'All future features',
      'Early access to new tools',
    ],
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-app-dark" edges={['top']}>
      <StatusBar style="light" />
      <View className="px-5 pt-4 pb-6 flex-row items-center border-b border-neeva-glass-border">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center active:opacity-70">
          <ArrowLeft size={22} color="white" />
        </Pressable>
        <Text className="text-white text-card-title font-semibold ml-4">Subscription</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-white/40 text-body-sm text-center mt-6 mb-2">
          Choose the plan that fits your wellness journey
        </Text>

        <View className="mt-4">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <View
                key={plan.name}
                className={`mb-4 rounded-glass border p-5 ${
                  plan.popular
                    ? 'bg-neeva-purple-600/15 border-neeva-purple-500/40'
                    : 'bg-neeva-glass-dark/20 border-neeva-glass-border'
                }`}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${plan.color}20` }}
                    >
                      <Icon size={20} color={plan.color} />
                    </View>
                    <View>
                      <Text className="text-white text-body font-semibold">{plan.name}</Text>
                      <View className="flex-row items-baseline">
                        <Text className="text-white text-card-title font-bold">{plan.price}</Text>
                        <Text className="text-white/40 text-body-sm ml-1">{plan.period}</Text>
                      </View>
                    </View>
                  </View>
                  {plan.popular && (
                    <View className="bg-neeva-purple-600 rounded-full px-3 py-1">
                      <Text className="text-white text-label font-semibold">Popular</Text>
                    </View>
                  )}
                </View>

                <View className="mt-2">
                  {plan.features.map((feature) => (
                    <View key={feature} className="flex-row items-center mb-2">
                      <Check size={14} color={plan.color} />
                      <Text className="text-white/70 text-body-sm ml-2">{feature}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  className={`mt-4 rounded-glass py-3 items-center ${
                    plan.popular
                      ? 'bg-neeva-purple-600 active:opacity-70'
                      : 'bg-neeva-glass-dark/40 border border-neeva-glass-border active:opacity-70'
                  }`}
                >
                  <Text className={`text-body font-semibold ${plan.popular ? 'text-white' : 'text-white/80'}`}>
                    {plan.name === 'Free' ? 'Current Plan' : `Subscribe — ${plan.price}${plan.period}`}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {!features.subscriptions && (
          <View className="mt-4 bg-neeva-glass-dark/20 rounded-glass p-4 border border-neeva-glass-border">
            <Text className="text-white/50 text-body-sm text-center leading-relaxed">
              Subscription management is currently in development. Payment processing will be available soon with RevenueCat or Stripe integration. You are on the Free plan by default.
            </Text>
          </View>
        )}

        <Text className="text-white/30 text-body-sm text-center mt-6">
          Cancel anytime. Your data is always yours.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
