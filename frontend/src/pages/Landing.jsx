import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppTranslation } from '../hooks/useTranslation';
import { useAuthStore } from '../store/authStore';
import {
  Sprout,
  MessageCircle,
  Wifi,
  Globe,
  ChevronRight,
  Star,
  Shield,
  TrendingUp,
  Heart,
  FileText,
} from 'lucide-react';

const TypewriterText = ({ texts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[currentIndex];
    let timeout;

    if (!isDeleting) {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30);
      } else {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % texts.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex, texts]);

  return (
    <span className="text-primary">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="card group cursor-pointer"
  >
    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
    <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const StatCard = ({ value, label }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="text-center"
  >
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-white/80">{label}</div>
  </motion.div>
);

const Landing = () => {
  const { t, currentLanguage, changeLanguage, languages } = useAppTranslation();
  const { isAuthenticated } = useAuthStore();

  const taglines = [
    t('app.tagline'),
    'किसानों के लिए AI सहायक',
    'ರೈತರಿಗೆ AI ಸಹಾಯಕ',
  ];

  const features = [
    {
      icon: MessageCircle,
      title: 'AI Chat Assistant',
      description: 'Get instant answers about farming, health, government schemes, and market prices in your language.',
      delay: 0.1,
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'Available in English, Hindi, and Kannada. Ask questions and get responses in your preferred language.',
      delay: 0.2,
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Farmers Helped' },
    { value: '200+', label: 'Government Schemes' },
    { value: '3', label: 'Languages Supported' },
    { value: '24/7', label: 'AI Assistance' },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Navigation */}
      <nav className="shadow-sm sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-[#1E1E2E]/80 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">{t('app.name')}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 rounded-full text-sm text-text-secondary hover:bg-gray-100 transition-all">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:block">
                  {languages.find((l) => l.code === currentLanguage)?.name}
                </span>
              </button>
              <div className="absolute right-0 mt-1 w-36 bg-surface rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl ${
                      currentLanguage === lang.code ? 'text-primary font-medium' : 'text-text-secondary'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
            {isAuthenticated ? (
              <Link to="/chat" className="btn-primary text-sm">
                Go to Chat
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  {t('auth.registerBtn')}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://png.pngtree.com/background/20210710/original/pngtree-hand-painted-background-design-of-the-first-chinese-farmers-harvest-festival-picture-image_978936.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/25" />
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900 border border-primary-100 dark:border-primary-800 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 cursor-pointer"
            >
              <Star className="w-4 h-4" />
              <span>{t('auth.socialProof')}</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 mb-6 leading-tight pb-2">
              <TypewriterText texts={taglines} />
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl mx-auto font-medium"
            >
              {t('app.subtitle')}
            </motion.p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {isAuthenticated ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/chat" className="btn-primary text-lg px-8 py-4 shadow-lg shadow-primary/20">
                    Start Chatting
                    <ChevronRight className="w-5 h-5 ml-2 inline" />
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/register" className="btn-primary text-lg px-8 py-4 shadow-lg shadow-primary/20">
                      {t('auth.registerBtn')}
                      <ChevronRight className="w-5 h-5 ml-2 inline" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/login" className="btn-secondary text-lg px-8 py-4 dark:border-gray-600 dark:text-gray-300">
                      {t('nav.login')}
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/40 dark:bg-[#1E1E2E]/40 backdrop-blur-sm py-20 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything You Need
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Powerful features designed for rural India
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-full max-w-xl"
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sprout, title: 'Agriculture', desc: 'Crop calendar, pest control, fertilizer advice' },
              { icon: Heart, title: 'Healthcare', desc: 'Symptom checker, first aid, emergency info' },
              { icon: FileText, title: 'Schemes', desc: 'Government scheme details & eligibility' },
              { icon: TrendingUp, title: 'Mandi Prices', desc: 'Market prices, MSP, e-NAM info' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, type: "spring" }}
                whileHover={{ x: 5, scale: 1.02 }}
                className="flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">{item.title}</h4>
                  <p className="text-sm text-text-secondary">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
              Join thousands of farmers and rural workers using GramaAI Lite for free.
            </p>
            {!isAuthenticated && (
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Create Free Account
                <ChevronRight className="w-5 h-5 ml-2 inline" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="w-6 h-6 text-primary-300" />
            <span className="font-bold text-lg">{t('app.name')}</span>
          </div>
          <p className="text-gray-400 text-sm mb-2">
            Empowering rural India with AI-powered assistance in your language.
          </p>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {t('app.name')}. Made with ❤️ by TechTwins🧑‍🤝‍🧑.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
