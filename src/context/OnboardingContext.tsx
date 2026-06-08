import React, {
  createContext,
  useContext,
  useState,
} from 'react';

const OnboardingContext =
  createContext<any>(null);

export function OnboardingProvider({
  children,
}: any) {
  const [
    onboardingData,
    setOnboardingData,
  ] = useState({
    goals: [],
    trainingExperience: '',
    activityLevel: '',
    gymAccess: '',
    healthConditions: [],
  });

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        setOnboardingData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(
    OnboardingContext
  );
}