import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppTranslation } from '../hooks/useTranslation';
import { Heart, Stethoscope, Phone, Ambulance, Lightbulb, Search, MapPin } from 'lucide-react';

const healthTips = [
  { title: 'Wash Hands Regularly', desc: 'Prevent infections by washing hands with soap for 20 seconds.' },
  { title: 'Drink Clean Water', desc: 'Boil water before drinking or use a water purifier.' },
  { title: 'Mosquito Prevention', desc: 'Use mosquito nets and remove stagnant water around your home.' },
  { title: 'Balanced Diet', desc: 'Include fruits, vegetables, and grains in your daily meals.' },
  { title: 'Vaccination', desc: 'Ensure children get all recommended vaccines on time.' },
];

const emergencyNumbers = [
  { name: 'Ambulance', number: '108', icon: Ambulance },
  { name: 'Police', number: '100', icon: Phone },
  { name: 'Fire', number: '101', icon: Phone },
  { name: 'Women Helpline', number: '1091', icon: Phone },
  { name: 'Child Helpline', number: '1098', icon: Phone },
  { name: 'COVID Helpline', number: '1075', icon: Phone },
];

const symptomChecker = {
  fever: ['Malaria', 'Dengue', 'Typhoid', 'Common Cold', 'COVID-19'],
  cough: ['Common Cold', 'Bronchitis', 'Pneumonia', 'COVID-19', 'Tuberculosis'],
  headache: ['Migraine', 'Dengue', 'Sinusitis', 'Tension Headache', 'COVID-19'],
  stomach: ['Food Poisoning', 'Gastritis', 'Diarrhea', 'Typhoid', 'Appendicitis'],
  bodypain: ['Dengue', 'Malaria', 'Typhoid', 'Influenza', 'COVID-19'],
};

const Healthcare = () => {
  const { t } = useAppTranslation();
  const [symptom, setSymptom] = useState('');
  const [results, setResults] = useState([]);

  const handleSymptomCheck = () => {
    const q = symptom.toLowerCase();
    const matched = [];
    for (const [key, conditions] of Object.entries(symptomChecker)) {
      if (q.includes(key)) {
        matched.push(...conditions);
      }
    }
    setResults([...new Set(matched)].slice(0, 5));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('healthcare.title')}</h1>
        <p className="text-text-secondary mt-1">Health information and emergency resources</p>
      </div>

      {/* Emergency Numbers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-red-500 to-red-600 text-white"
      >
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5" />
          <h3 className="font-semibold">{t('healthcare.emergency')}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {emergencyNumbers.map((item) => (
            <a
              key={item.name}
              href={`tel:${item.number}`}
              className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5 hover:bg-white/20 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              <div>
                <div className="text-xs opacity-80">{item.name}</div>
                <div className="font-bold">{item.number}</div>
              </div>
            </a>
          ))}
        </div>
      </motion.div>

      {/* Symptom Checker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">{t('healthcare.symptomChecker')}</h3>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          Describe your symptoms (e.g., fever, cough, headache)
        </p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSymptomCheck()}
              placeholder="Type your symptoms..."
              className="input-field pl-10"
            />
          </div>
          <button onClick={handleSymptomCheck} className="btn-primary">
            Check
          </button>
        </div>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-yellow-50 rounded-xl"
          >
            <p className="text-sm font-medium text-yellow-800 mb-2">
              Possible conditions (consult a doctor):
            </p>
            <ul className="space-y-1">
              {results.map((condition, i) => (
                <li key={i} className="text-sm text-yellow-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  {condition}
                </li>
              ))}
            </ul>
            <p className="text-xs text-yellow-600 mt-2">
              ⚠️ This is not a medical diagnosis. Please consult a doctor.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Health Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-semibold text-text-primary mb-4">{t('healthcare.tips')}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {healthTips.map((tip, i) => (
            <div key={i} className="card flex items-start gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-medium text-text-primary text-sm">{tip.title}</h4>
                <p className="text-xs text-text-secondary mt-1">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Nearby Health Centers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">{t('healthcare.nearby')}</h3>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Primary Health Center (PHC)', distance: '2.5 km', type: 'Government' },
            { name: 'Community Health Center (CHC)', distance: '8 km', type: 'Government' },
            { name: 'District Hospital', distance: '25 km', type: 'Government' },
            { name: 'Private Clinic', distance: '3 km', type: 'Private' },
          ].map((center, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <h4 className="text-sm font-medium text-text-primary">{center.name}</h4>
                <p className="text-xs text-text-secondary">{center.type}</p>
              </div>
              <span className="text-sm text-primary font-medium">{center.distance}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Healthcare;
