
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { updateUserHealthInfo } = useAuth();
  
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [goal, setGoal] = useState<'gain' | 'loss' | 'maintain'>('maintain');
  const [dietPreference, setDietPreference] = useState<'veg' | 'nonveg' | 'vegan'>('nonveg');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'>('moderate');
  
  const allergyOptions = [
    'Dairy', 'Nuts', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Gluten'
  ];
  
  const toggleAllergy = (allergy: string) => {
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter(a => a !== allergy));
    } else {
      setAllergies([...allergies, allergy]);
    }
  };
  
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleComplete = async () => {
    try {
      await updateUserHealthInfo({
        height: parseInt(height),
        weight: parseInt(weight),
        allergies,
        goal,
        dietPreference,
        activityLevel,
      });
      
      toast.success('Profile setup complete!');
      navigate('/home');
    } catch (error) {
      toast.error('Failed to save your information');
    }
  };
  
  const validateCurrentStep = () => {
    switch(step) {
      case 1:
        return height && weight;
      case 2:
        return true; // Allergies are optional
      case 3:
        return goal && dietPreference && activityLevel;
      default:
        return false;
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-fitness-light to-white">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-fitness-secondary text-center">
            Let's Set Up Your Profile
          </CardTitle>
          <div className="flex justify-between mt-4">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-fitness-primary' : 'bg-gray-200'} mx-1`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-fitness-primary' : 'bg-gray-200'} mx-1`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-fitness-primary' : 'bg-gray-200'} mx-1`}></div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold">Basic Measurements</h2>
              
              <div className="space-y-2">
                <label htmlFor="height" className="text-sm font-medium">
                  Height (cm)
                </label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Enter your height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="fitness-input"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="weight" className="text-sm font-medium">
                  Weight (kg)
                </label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Enter your weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="fitness-input"
                />
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold">Allergies & Restrictions</h2>
              <p className="text-sm text-gray-600 mb-2">Select any food allergies or sensitivities:</p>
              
              <div className="grid grid-cols-2 gap-3">
                {allergyOptions.map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`allergy-${allergy}`}
                      checked={allergies.includes(allergy)}
                      onCheckedChange={() => toggleAllergy(allergy)}
                    />
                    <label 
                      htmlFor={`allergy-${allergy}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {allergy}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  This information helps us customize your meal recommendations.
                </p>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold">Fitness & Diet Goals</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight Goal</label>
                <Select 
                  value={goal} 
                  onValueChange={(value) => setGoal(value as 'gain' | 'loss' | 'maintain')}
                >
                  <SelectTrigger className="fitness-input">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gain">Weight Gain</SelectItem>
                    <SelectItem value="loss">Weight Loss</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Diet Preference</label>
                <Select 
                  value={dietPreference} 
                  onValueChange={(value) => setDietPreference(value as 'veg' | 'nonveg' | 'vegan')}
                >
                  <SelectTrigger className="fitness-input">
                    <SelectValue placeholder="Select your preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">Vegetarian</SelectItem>
                    <SelectItem value="nonveg">Non-Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Activity Level</label>
                <Select 
                  value={activityLevel} 
                  onValueChange={(value) => setActivityLevel(value as any)}
                >
                  <SelectTrigger className="fitness-input">
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                    <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                    <SelectItem value="very-active">Very Active (professional/athlete)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div></div> // Empty div to maintain layout
          )}
          
          <Button 
            onClick={handleNext}
            disabled={!validateCurrentStep()}
            className="fitness-gradient"
          >
            {step === 3 ? 'Complete' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingPage;
