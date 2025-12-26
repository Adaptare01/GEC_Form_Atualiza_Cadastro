import React, { useState } from 'react';
import { Step } from './types';
import { StartScreen } from './screens/StartScreen';
import { ConsentScreen } from './screens/ConsentScreen';
import { PersonalDataScreen } from './screens/PersonalDataScreen';
import { ProfessionalDataScreen } from './screens/ProfessionalDataScreen';
import { SpouseScreen } from './screens/SpouseScreen';
import { DependentsScreen } from './screens/DependentsScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { FormProvider } from './contexts/FormContext';

const AppContent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Start);
  const [consentChecked, setConsentChecked] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);

  React.useEffect(() => {
    // Check URL for id parameter
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setViewId(id);
    }
  }, []);

  if (viewId) {
    return <SummaryScreen id={viewId} />;
  }

  // Simple scrolling to top on step change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < Step.Success) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > Step.Start) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  switch (currentStep) {
    case Step.Start:
      return <StartScreen onNext={nextStep} />;
    case Step.Consent:
      return (
        <ConsentScreen
          onNext={nextStep}
          onBack={prevStep}
          checked={consentChecked}
          setChecked={setConsentChecked}
        />
      );
    case Step.Personal:
      return <PersonalDataScreen onNext={nextStep} onBack={prevStep} />;
    case Step.Professional:
      return <ProfessionalDataScreen onNext={nextStep} onBack={prevStep} />;
    case Step.Spouse:
      return <SpouseScreen onNext={nextStep} onBack={prevStep} />;
    case Step.Dependents:
      return <DependentsScreen onNext={nextStep} onBack={prevStep} />;
    case Step.Success:
      return <SuccessScreen onRestart={() => goToStep(Step.Start)} />;
    default:
      return <StartScreen onNext={nextStep} />;
  }
};

const App: React.FC = () => {
  return (
    <FormProvider>
      <AppContent />
    </FormProvider>
  );
};

export default App;