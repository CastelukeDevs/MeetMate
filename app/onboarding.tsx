import { Onboarding, useOnboarding } from "@/components/ui/onboarding";
import { Text } from "@/components/ui/text";
import useAppDefault from "@/hooks/store/useAppDefault";
import { router } from "expo-router";
import { useEffect } from "react";

const OnboardingPresets = {
  welcome: [
    {
      id: "welcome",
      title: "Welcome to Our App",
      description:
        "Discover amazing features and get started with your journey.",
      icon: <Text style={{ fontSize: 80 }}>👋</Text>,
    },
    {
      id: "features",
      title: "Powerful Features",
      description:
        "Experience cutting-edge functionality designed to make your life easier.",
      icon: <Text style={{ fontSize: 80 }}>⚡</Text>,
    },
    {
      id: "personalize",
      title: "Personalize Your Experience",
      description: "Customize the app to match your preferences and workflow.",
      icon: <Text style={{ fontSize: 80 }}>🎨</Text>,
    },
    {
      id: "ready",
      title: "You're All Set!",
      description:
        "Everything is ready. Let's start exploring what you can achieve.",
      icon: <Text style={{ fontSize: 80 }}>🚀</Text>,
    },
  ],

  features: [
    {
      id: "organize",
      title: "Stay Organized",
      description: "Keep all your important information in one secure place.",
      icon: <Text style={{ fontSize: 80 }}>📋</Text>,
    },
    {
      id: "collaborate",
      title: "Collaborate Seamlessly",
      description: "Work together with your team in real-time, anywhere.",
      icon: <Text style={{ fontSize: 80 }}>🤝</Text>,
    },
    {
      id: "automate",
      title: "Automate Your Workflow",
      description: "Set up smart automations to save time and reduce errors.",
      icon: <Text style={{ fontSize: 80 }}>🤖</Text>,
    },
  ],

  security: [
    {
      id: "secure",
      title: "Your Data is Secure",
      description:
        "We use end-to-end encryption to keep your information safe.",
      icon: <Text style={{ fontSize: 80 }}>🔒</Text>,
    },
    {
      id: "privacy",
      title: "Privacy First",
      description: "We never share your personal data with third parties.",
      icon: <Text style={{ fontSize: 80 }}>🛡️</Text>,
    },
    {
      id: "control",
      title: "You're in Control",
      description: "Manage your privacy settings and data preferences anytime.",
      icon: <Text style={{ fontSize: 80 }}>⚙️</Text>,
    },
  ],
};

function OnboardingDemo() {
  const { hasCompletedOnboarding, completeOnboarding, skipOnboarding } =
    useOnboarding();

  const { setIsFirstTime } = useAppDefault();

  useEffect(() => {
    if (hasCompletedOnboarding) {
      router.replace("/auth");
      setIsFirstTime(false);
    }
  }, [hasCompletedOnboarding, setIsFirstTime]);

  return (
    <Onboarding
      steps={OnboardingPresets.welcome}
      onComplete={completeOnboarding}
      onSkip={skipOnboarding}
      showSkip={true}
      showProgress={true}
      swipeEnabled={true}
      primaryButtonText="Get Started"
      skipButtonText="Skip"
      nextButtonText="Next"
      backButtonText="Back"
    />
  );
}

export default OnboardingDemo;
