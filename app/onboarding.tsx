import { Onboarding, useOnboarding } from "@/components/ui/onboarding";
import { Text } from "@/components/ui/text";
import useAppDefault from "@/hooks/store/useAppDefault";
import { router } from "expo-router";
import { useEffect } from "react";

const onboardingSteps = [
  {
    id: "welcome",
    title: "Welcome to MeetMate",
    description:
      "Your AI-powered meeting companion. Record, transcribe, and summarize your meetings effortlessly.",
    icon: <Text style={{ fontSize: 80 }}>🎙️</Text>,
  },
  {
    id: "record",
    title: "Record Your Meetings",
    description:
      "Capture every detail with high-quality audio recording. Just tap and start.",
    icon: <Text style={{ fontSize: 80 }}>🔴</Text>,
  },
  {
    id: "transcribe",
    title: "AI Transcription",
    description:
      "Get accurate transcriptions powered by AI. Every word captured with timestamps.",
    icon: <Text style={{ fontSize: 80 }}>📝</Text>,
  },
  {
    id: "summarize",
    title: "Smart Summaries",
    description:
      "Save time with AI-generated summaries. Get the key points without reading everything.",
    icon: <Text style={{ fontSize: 80 }}>✨</Text>,
  },
  {
    id: "ready",
    title: "You're All Set!",
    description:
      "Start recording your first meeting and let MeetMate handle the rest.",
    icon: <Text style={{ fontSize: 80 }}>🚀</Text>,
  },
];

function OnboardingScreen() {
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
      steps={onboardingSteps}
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

export default OnboardingScreen;
