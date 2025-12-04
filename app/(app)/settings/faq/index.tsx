import React, { useState } from "react";
import {
    LayoutAnimation,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqData = [
  {
    question: "How do I reset my password?",
    answer:
      "Go to Settings → Change Password. Enter your current password and your new password.",
  },
  {
    question: "How do I change my email address?",
    answer:
      "You can change your email in Settings → Change Email. You will need to re-login for verification.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use industry-standard security practices to protect your account and personal information.",
  },
];

export default function FAQScreen() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(prev => (prev === index ? null : index));
  };

  return (
    <ScrollView className="flex-1 p-5 bg-white dark:bg-neutral-900">
      <Text className="text-2xl font-bold mb-5 text-neutral-800 dark:text-neutral-100">
        Frequently Asked Questions
      </Text>

      {faqData.map((item, index) => {
        const isOpen = activeIndex === index;

        return (
          <View
            key={index}
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 mb-3 px-4 py-3"
          >
            <TouchableOpacity
              onPress={() => toggleItem(index)}
              className="flex-row justify-between items-center"
            >
              <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100 flex-1">
                {item.question}
              </Text>

              <Text className="text-2xl font-bold text-neutral-500 dark:text-neutral-300 px-2">
                {isOpen ? "−" : "+"}
              </Text>
            </TouchableOpacity>

            {isOpen && (
              <View className="mt-2 pr-8">
                <Text className="text-sm text-neutral-600 dark:text-neutral-300 leading-5">
                  {item.answer}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
