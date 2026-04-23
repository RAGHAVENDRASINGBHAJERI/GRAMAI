import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppTranslation } from '../hooks/useTranslation';
import { useOffline } from '../hooks/useOffline';
import { Search, Filter, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const defaultSchemes = [
  {
    id: 1,
    name: 'PM-KISAN',
    nameHi: 'प्रधानमंत्री किसान सम्मान निधि',
    nameKn: 'ಪ್ರಧಾನಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ',
    benefits: ['₹6,000 per year in 3 equal installments', 'Direct bank transfer', 'For all landholding farmers'],
    eligibility: ['All farmer families with cultivable land', 'Landholding farmers', 'Excludes institutional land holders'],
    steps: ['Visit PM-KISAN portal', 'Fill application form', 'Upload land documents', 'Aadhaar verification'],
    ministry: 'Ministry of Agriculture',
    state: null,
    tags: ['income-support', 'farmers', 'central'],
  },
  {
    id: 2,
    name: 'PMFBY',
    nameHi: 'प्रधानमंत्री फसल बीमा योजना',
    nameKn: 'ಪ್ರಧಾನಮಂತ್ರಿ ಬೆಳೆ ವಿಮಾ ಯೋಜನೆ',
    benefits: ['Crop insurance at low premium', 'Coverage for all stages of crop', 'Quick claim settlement'],
    eligibility: ['All farmers growing notified crops', 'Loanee farmers are covered', 'Non-loanee farmers can apply'],
    steps: ['Visit nearest bank branch', 'Fill insurance form', 'Pay premium', 'Submit crop details'],
    ministry: 'Ministry of Agriculture',
    state: null,
    tags: ['insurance', 'crops', 'central'],
  },
  {
    id: 3,
    name: 'PM-KUSUM',
    nameHi: 'प्रधानमंत्री कुसुम योजना',
    nameKn: 'ಪ್ರಧಾನಮಂತ್ರಿ ಕುಸುಮ್ ಯೋಜನೆ',
    benefits: ['Subsidy on solar pumps', 'Solarization of grid-connected pumps', 'Additional income from solar power'],
    eligibility: ['Individual farmers', 'Farmer groups', 'Cooperative societies'],
    steps: ['Apply through state nodal agency', 'Submit land documents', 'Technical feasibility check', 'Installation'],
    ministry: 'Ministry of New & Renewable Energy',
    state: null,
    tags: ['solar', 'energy', 'subsidy'],
  },
  {
    id: 4,
    name: 'Ayushman Bharat',
    nameHi: 'आयुष्मान भारत',
    nameKn: 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್',
    benefits: ['Health cover of ₹5 lakh per family', 'Cashless treatment', 'Covers pre-existing diseases'],
    eligibility: ['Families identified from SECC database', 'Rural and urban poor', 'No age limit'],
    steps: ['Check eligibility on portal', 'Visit empanelled hospital', 'Show Ayushman card', 'Get cashless treatment'],
    ministry: 'Ministry of Health',
    state: null,
    tags: ['health', 'insurance', 'central'],
  },
  {
    id: 5,
    name: 'Karnataka Raitha Suraksha',
    nameKn: 'ಕರ್ನಾಟಕ ರೈತ ಸುರಕ್ಷಾ ಯೋಜನೆ',
    benefits: ['Crop loss compensation', 'Natural disaster coverage', 'Input subsidy'],
    eligibility: ['Karnataka farmers', 'Registered with Raitha Samparka Kendras'],
    steps: ['Register at Raitha Samparka Kendra', 'Submit land records', 'File claim after crop loss'],
    ministry: 'Karnataka Agriculture Department',
    state: 'Karnataka',
    tags: ['state-scheme', 'karnataka', 'crop-insurance'],
  },
];

const Schemes = () => {
  const { t, currentLanguage } = useAppTranslation();
  const { isOnline } = useOffline();
  const [schemes, setSchemes] = useState(defaultSchemes);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [filterState, setFilterState] = useState('all');

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch = scheme.name.toLowerCase().includes(search.toLowerCase()) ||
      (scheme.nameHi && scheme.nameHi.includes(search)) ||
      (scheme.nameKn && scheme.nameKn.includes(search));
    const matchesFilter = filterState === 'all' || 
      (filterState === 'central' && !scheme.state) ||
      (filterState === 'state' && scheme.state);
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const getName = (scheme) => {
    if (currentLanguage === 'kn' && scheme.nameKn) return scheme.nameKn;
    if (currentLanguage === 'hi' && scheme.nameHi) return scheme.nameHi;
    return scheme.name;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('schemes.title')}</h1>
        <p className="text-text-secondary mt-1">Government schemes for farmers and rural families</p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('schemes.search')}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="input-field w-32"
        >
          <option value="all">{t('schemes.filter')}</option>
          <option value="central">Central</option>
          <option value="state">State</option>
        </select>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
          Showing cached scheme data. Updates when online.
        </div>
      )}

      {/* Schemes List */}
      <div className="space-y-4">
        {filteredSchemes.map((scheme, i) => (
          <motion.div
            key={scheme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">{getName(scheme)}</h3>
                <p className="text-xs text-text-secondary mt-1">{scheme.ministry}</p>
                {scheme.state && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">
                    {scheme.state}
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleSave(scheme.id)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {savedIds.has(scheme.id) ? (
                  <BookmarkCheck className="w-5 h-5 text-primary" />
                ) : (
                  <Bookmark className="w-5 h-5 text-text-secondary" />
                )}
              </button>
            </div>

            <p className="text-sm text-text-secondary mt-3 line-clamp-2">
              {scheme.benefits[0]}
            </p>

            <div className="flex items-center gap-2 mt-3">
              {scheme.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-text-secondary text-[10px] font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => toggleExpand(scheme.id)}
              className="flex items-center gap-1 mt-3 text-sm text-primary font-medium hover:underline"
            >
              {expandedId === scheme.id ? (
                <>Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>{t('schemes.learnMore')} <ChevronDown className="w-4 h-4" /></>
              )}
            </button>

            <AnimatePresence>
              {expandedId === scheme.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4 border-t border-gray-100 mt-3">
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-2">Benefits</h4>
                      <ul className="space-y-1">
                        {scheme.benefits.map((b, i) => (
                          <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-2">Eligibility</h4>
                      <ul className="space-y-1">
                        {scheme.eligibility.map((e, i) => (
                          <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-2">How to Apply</h4>
                      <ol className="space-y-1">
                        {scheme.steps.map((s, i) => (
                          <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="w-5 h-5 bg-primary-50 text-primary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                              {i + 1}
                            </span>
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Schemes;
