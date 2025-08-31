import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const LandingPage = () => {
  const { language, changeLanguage } = useLanguage();

  const features = [
    {
      icon: "📄",
      titleEn: "Create Professional Invoices",
      titleGu: "વ્યાવસાયિક ઇન્વૉઇસ બનાવો",
      descEn: "Generate beautiful, professional invoices with GST compliance in minutes.",
      descGu: "મિનિટોમાં GST અનુપાલન સાથે સુંદર, વ્યાવસાયિક ઇન્વૉઇસ બનાવો."
    },
    {
      icon: "👥",
      titleEn: "Customer Management",
      titleGu: "ગ્રાહક વ્યવસ્થાપન",
      descEn: "Organize your customers with complete contact details and billing history.",
      descGu: "સંપૂર્ણ સંપર્ક વિગતો અને બિલિંગ ઇતિહાસ સાથે તમારા ગ્રાહકોને વ્યવસ્થિત કરો."
    },
    {
      icon: "📦",
      titleEn: "Product Catalog",
      titleGu: "ઉત્પાદન કેટલોગ",
      descEn: "Maintain your product inventory with pricing, tax rates, and descriptions.",
      descGu: "કિંમત, કર દરો અને વર્ણનો સાથે તમારી ઉત્પાદન ઇન્વેન્ટરી જાળવો."
    },
    {
      icon: "💰",
      titleEn: "Payment Tracking",
      titleGu: "ચુકવણી ટ્રેકિંગ",
      descEn: "Track payments, manage outstanding amounts, and send payment reminders.",
      descGu: "ચુકવણીઓને ટ્રેક કરો, બાકી રકમ મેનેજ કરો અને ચુકવણી રિમાઇન્ડર મોકલો."
    },
    {
      icon: "📊",
      titleEn: "Business Analytics",
      titleGu: "બિઝનેસ એનાલિટિક્સ",
      descEn: "Get insights into your sales, revenue trends, and business performance.",
      descGu: "તમારા વેચાણ, આવકના વલણો અને બિઝનેસ પ્રદર્શનની સમજ મેળવો."
    },
    {
      icon: "🔒",
      titleEn: "Secure & Reliable",
      titleGu: "સુરક્ષિત અને વિશ્વસનીય",
      descEn: "Your data is safe with enterprise-grade security and regular backups.",
      descGu: "એન્ટરપ્રાઇઝ-ગ્રેડ સિક્યોરિટી અને નિયમિત બેકઅપ્સ સાથે તમારો ડેટા સુરક્ષિત છે."
    }
  ];

  const steps = [
    {
      step: 1,
      titleEn: "Sign Up",
      titleGu: "સાઇન અપ કરો",
      descEn: "Create your free account in under 2 minutes",
      descGu: "2 મિનિટમાં તમારું મફત એકાઉન્ટ બનાવો"
    },
    {
      step: 2,
      titleEn: "Add Your Business Details",
      titleGu: "તમારી બિઝનેસ વિગતો ઉમેરો",
      descEn: "Set up your company information and GST details",
      descGu: "તમારી કંપનીની માહિતી અને GST વિગતો સેટ કરો"
    },
    {
      step: 3,
      titleEn: "Create Your First Invoice",
      titleGu: "તમારી પ્રથમ ઇન્વૉઇસ બનાવો",
      descEn: "Add customers, products, and generate professional invoices",
      descGu: "ગ્રાહકો, ઉત્પાદનો ઉમેરો અને વ્યાવસાયિક ઇન્વૉઇસ બનાવો"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                📄
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {language === 'en' ? 'Invoice Generator' : 'ઇન્વૉઇસ જનરેટર'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => changeLanguage(language === 'en' ? 'gu' : 'en')}
                className="px-3 py-1 rounded-lg border border-neutral-300 hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                {language === 'en' ? 'ગુજરાતી' : 'English'}
              </button>
              
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                {language === 'en' ? 'Get Started' : 'શરૂ કરો'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              {language === 'en' ? (
                <>
                  Simplify Your
                  <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    {' '}Business Invoicing
                  </span>
                </>
              ) : (
                <>
                  તમારી
                  <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    {' '}બિઝનેસ ઇન્વૉઇસિંગ
                  </span>
                  {' '}સરળ બનાવો
                </>
              )}
            </h1>
            
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {language === 'en' 
                ? "Create professional GST-compliant invoices, manage customers, track payments, and grow your business with our comprehensive invoice management system."
                : "અમારી વ્યાપક ઇન્વૉઇસ મેનેજમેન્ટ સિસ્ટમ સાથે વ્યાવસાયિક GST-અનુપાલન ઇન્વૉઇસ બનાવો, ગ્રાહકોને મેનેજ કરો, ચુકવણીઓને ટ્રેક કરો અને તમારા બિઝનેસને વધારો."
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                <span className="mr-2">🚀</span>
                {language === 'en' ? 'Start Free Trial' : 'મફત ટ્રાયલ શરૂ કરો'}
              </Link>
              
              <button className="border-2 border-primary-200 text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all duration-200 flex items-center justify-center">
                <span className="mr-2">▶️</span>
                {language === 'en' ? 'Watch Demo' : 'ડેમો જુઓ'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-warning-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-neutral-600">
                {language === 'en' ? 'Invoices Generated' : 'ઇન્વૉઇસ બનાવાયા'}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-600 mb-2">500+</div>
              <div className="text-neutral-600">
                {language === 'en' ? 'Happy Businesses' : 'ખુશ બિઝનેસ'}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success-600 mb-2">₹50L+</div>
              <div className="text-neutral-600">
                {language === 'en' ? 'Revenue Processed' : 'આવક પ્રોસેસ કરી'}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-warning-600 mb-2">99.9%</div>
              <div className="text-neutral-600">
                {language === 'en' ? 'Uptime' : 'અપટાઇમ'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              {language === 'en' ? 'Everything You Need to Manage Your Business' : 'તમારા બિઝનેસને મેનેજ કરવા માટે જરૂરી બધું'}
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {language === 'en' 
                ? "Our comprehensive invoice management system provides all the tools you need to streamline your business operations."
                : "અમારી વ્યાપક ઇન્વૉઇસ મેનેજમેન્ટ સિસ્ટમ તમારા બિઝનેસ ઓપરેશનને સરળ બનાવવા માટે જરૂરી તમામ ટૂલ્સ પ્રદાન કરે છે."
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:scale-105 border border-neutral-100"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {language === 'en' ? feature.titleEn : feature.titleGu}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {language === 'en' ? feature.descEn : feature.descGu}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              {language === 'en' ? 'Get Started in 3 Simple Steps' : '3 સરળ પગલાંમાં શરૂ કરો'}
            </h2>
            <p className="text-xl text-neutral-600">
              {language === 'en' 
                ? "Setting up your invoice management system has never been easier"
                : "તમારી ઇન્વૉઇસ મેનેજમેન્ટ સિસ્ટમ સેટ કરવી ક્યારેય આટલી સરળ ન હતી"
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {language === 'en' ? step.titleEn : step.titleGu}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {language === 'en' ? step.descEn : step.descGu}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              {language === 'en' ? 'What Our Customers Say' : 'અમારા ગ્રાહકો શું કહે છે'}
            </h2>
            <p className="text-xl text-neutral-600">
              {language === 'en' 
                ? "Join thousands of satisfied businesses using our platform"
                : "અમારા પ્લેટફોર્મનો ઉપયોગ કરતા હજારો સંતુષ્ટ બિઝનેસમાં જોડાઓ"
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-soft-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-neutral-900">
                    {language === 'en' ? 'Amit Patel' : 'અમિત પટેલ'}
                  </h4>
                  <p className="text-neutral-600 text-sm">
                    {language === 'en' ? 'Small Business Owner' : 'નાના બિઝનેસ માલિક'}
                  </p>
                </div>
              </div>
              <div className="text-yellow-400 mb-4">★★★★★</div>
              <p className="text-neutral-700 leading-relaxed">
                {language === 'en' 
                  ? "This invoice system has completely transformed how I manage my business. GST compliance is automatic and the professional invoices have impressed my clients."
                  : "આ ઇન્વૉઇસ સિસ્ટમે મારા બિઝનેસને મેનેજ કરવાની રીતને સંપૂર્ણપણે બદલી નાખી છે. GST અનુપાલન ઓટોમેટિક છે અને વ્યાવસાયિક ઇન્વૉઇસથી મારા ક્લાયન્ટ્સ પ્રભાવિત થયા છે."
                }
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-soft-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  P
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-neutral-900">
                    {language === 'en' ? 'Priya Shah' : 'પ્રિયા શાહ'}
                  </h4>
                  <p className="text-neutral-600 text-sm">
                    {language === 'en' ? 'Freelance Consultant' : 'ફ્રીલાન્સ કન્સલ્ટન્ટ'}
                  </p>
                </div>
              </div>
              <div className="text-yellow-400 mb-4">★★★★★</div>
              <p className="text-neutral-700 leading-relaxed">
                {language === 'en' 
                  ? "Easy to use, professional results. I can create invoices in minutes and track payments effortlessly. The bilingual support is perfect for my diverse client base."
                  : "ઉપયોગમાં સરળ, વ્યાવસાયિક પરિણામો. હું મિનિટોમાં ઇન્વૉઇસ બનાવી શકું છું અને સરળતાથી ચુકવણીઓને ટ્રેક કરી શકું છું. દ્વિભાષી સપોર્ટ મારા વિવિધ ક્લાયન્ટ બેઝ માટે સંપૂર્ણ છે."
                }
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-soft-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-success-500 to-warning-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  R
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-neutral-900">
                    {language === 'en' ? 'Rajesh Mehta' : 'રાજેશ મહેતા'}
                  </h4>
                  <p className="text-neutral-600 text-sm">
                    {language === 'en' ? 'Retail Store Owner' : 'રિટેલ સ્ટોર માલિક'}
                  </p>
                </div>
              </div>
              <div className="text-yellow-400 mb-4">★★★★★</div>
              <p className="text-neutral-700 leading-relaxed">
                {language === 'en' 
                  ? "The analytics and reporting features help me understand my business better. Customer management is seamless and the GST reports are exactly what I need for filing."
                  : "એનાલિટિક્સ અને રિપોર્ટિંગ ફીચર્સ મને મારા બિઝનેસને વધુ સારી રીતે સમજવામાં મદદ કરે છે. કસ્ટમર મેનેજમેન્ટ સરળ છે અને GST રિપોર્ટ્સ ફાઇલિંગ માટે જરૂરી છે."
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GST Compliance Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {language === 'en' ? 'GST Compliant & Tax Ready' : 'GST અનુપાલન અને કર તૈયાર'}
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            {language === 'en' 
              ? "Our system automatically calculates GST, generates compliant invoices, and helps you stay tax-ready with detailed reports and audit trails."
              : "અમારી સિસ્ટમ આપમેળે GST ની ગણતરી કરે છે, અનુપાલન ઇન્વૉઇસ બનાવે છે અને વિગતવાર રિપોર્ટ્સ અને ઓડિટ ટ્રેઇલ્સ સાથે તમને કર-તૈયાર રહેવામાં મદદ કરે છે."
            }
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">✅</div>
              <h4 className="font-semibold mb-2">
                {language === 'en' ? 'Auto GST Calculation' : 'ઓટો GST ગણતરી'}
              </h4>
              <p className="opacity-90">
                {language === 'en' ? 'Automatic tax calculations' : 'ઓટોમેટિક ટેક્સ ગણતરી'}
              </p>
            </div>
            
            <div>
              <div className="text-3xl mb-3">📋</div>
              <h4 className="font-semibold mb-2">
                {language === 'en' ? 'Compliant Formats' : 'અનુપાલન ફોર્મેટ'}
              </h4>
              <p className="opacity-90">
                {language === 'en' ? 'Government approved templates' : 'સરકાર મંજૂર ટેમ્પલેટ્સ'}
              </p>
            </div>
            
            <div>
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-semibold mb-2">
                {language === 'en' ? 'Tax Reports' : 'ટેક્સ રિપોર્ટ્સ'}
              </h4>
              <p className="opacity-90">
                {language === 'en' ? 'Ready-to-file reports' : 'ફાઇલ કરવા માટે તૈયાર રિપોર્ટ્સ'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              {language === 'en' ? 'Simple, Transparent Pricing' : 'સરળ, પારદર્શક કિંમત'}
            </h2>
            <p className="text-xl text-neutral-600">
              {language === 'en' 
                ? "Choose the plan that fits your business needs"
                : "તમારા બિઝનેસની જરૂરિયાતોને અનુકૂળ યોજના પસંદ કરો"
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-primary-300 transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  {language === 'en' ? 'Starter' : 'સ્ટાર્ટર'}
                </h3>
                <div className="text-4xl font-bold text-primary-600 mb-4">
                  {language === 'en' ? 'Free' : 'મફત'}
                </div>
                <p className="text-neutral-600 mb-6">
                  {language === 'en' ? 'Perfect for small businesses' : 'નાના બિઝનેસ માટે પરફેક્ટ'}
                </p>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    {language === 'en' ? 'Up to 50 invoices/month' : '50 ઇન્વૉઇસ/મહિના સુધી'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    {language === 'en' ? 'Basic customer management' : 'બેસિક કસ્ટમર મેનેજમેન્ટ'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    {language === 'en' ? 'GST compliance' : 'GST અનુપાલન'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    {language === 'en' ? 'Email support' : 'ઇમેઇલ સપોર્ટ'}
                  </li>
                </ul>
                
                <Link
                  to="/dashboard"
                  className="w-full bg-primary-100 text-primary-700 py-3 rounded-xl font-semibold hover:bg-primary-200 transition-colors block text-center"
                >
                  {language === 'en' ? 'Get Started' : 'શરૂ કરો'}
                </Link>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-warning-400 text-warning-900 px-3 py-1 rounded-full text-sm font-semibold">
                {language === 'en' ? 'Popular' : 'લોકપ્રિય'}
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">
                  {language === 'en' ? 'Professional' : 'પ્રોફેશનલ'}
                </h3>
                <div className="text-4xl font-bold mb-4">
                  ₹499
                  <span className="text-lg opacity-80">/
                    {language === 'en' ? 'month' : 'મહિના'}
                  </span>
                </div>
                <p className="opacity-90 mb-6">
                  {language === 'en' ? 'For growing businesses' : 'વધતા બિઝનેસ માટે'}
                </p>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-300 mr-3">✓</span>
                    {language === 'en' ? 'Unlimited invoices' : 'અમર્યાદિત ઇન્વૉઇસ'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-300 mr-3">✓</span>
                    {language === 'en' ? 'Advanced analytics' : 'એડવાન્સ એનાલિટિક્સ'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-300 mr-3">✓</span>
                    {language === 'en' ? 'Payment tracking' : 'પેમેન્ટ ટ્રેકિંગ'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-300 mr-3">✓</span>
                    {language === 'en' ? 'Priority support' : 'પ્રાયોરિટી સપોર્ટ'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-300 mr-3">✓</span>
                    {language === 'en' ? 'Custom templates' : 'કસ્ટમ ટેમ્પલેટ્સ'}
                  </li>
                </ul>
                
                <Link
                  to="/dashboard"
                  className="w-full bg-white text-primary-600 py-3 rounded-xl font-semibold hover:bg-neutral-50 transition-colors block text-center"
                >
                  {language === 'en' ? 'Start Free Trial' : 'મફત ટ્રાયલ શરૂ કરો'}
                </Link>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-secondary-300 transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  {language === 'en' ? 'Enterprise' : 'એન્ટરપ્રાઇઝ'}
                </h3>
                <div className="text-4xl font-bold text-secondary-600 mb-4">
                  {language === 'en' ? 'Custom' : 'કસ્ટમ'}
                </div>
                <p className="text-neutral-600 mb-6">
                  {language === 'en' ? 'For large organizations' : 'મોટી સંસ્થાઓ માટે'}
                </p>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    {language === 'en' ? 'Everything in Pro' : 'પ્રોમાં બધું'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    {language === 'en' ? 'Multi-user access' : 'મલ્ટી-યુઝર એક્સેસ'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    {language === 'en' ? 'API integration' : 'API ઇન્ટિગ્રેશન'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    {language === 'en' ? 'Dedicated support' : 'ડેડિકેટેડ સપોર્ટ'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    {language === 'en' ? 'Custom integrations' : 'કસ્ટમ ઇન્ટિગ્રેશન'}
                  </li>
                </ul>
                
                <button className="w-full bg-secondary-100 text-secondary-700 py-3 rounded-xl font-semibold hover:bg-secondary-200 transition-colors">
                  {language === 'en' ? 'Contact Sales' : 'સેલ્સનો સંપર્ક કરો'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              {language === 'en' ? 'Frequently Asked Questions' : 'વારંવાર પૂછાયેલા પ્રશ્નો'}
            </h2>
            <p className="text-xl text-neutral-600">
              {language === 'en' 
                ? "Everything you need to know about our invoice management system"
                : "અમારી ઇન્વૉઇસ મેનેજમેન્ટ સિસ્ટમ વિશે તમારે જાણવાની જરૂર છે તે બધું"
              }
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                {language === 'en' 
                  ? 'Is the invoice system GST compliant?' 
                  : 'શું ઇન્વૉઇસ સિસ્ટમ GST અનુપાલન છે?'
                }
              </h3>
              <p className="text-neutral-600">
                {language === 'en' 
                  ? 'Yes, our system is fully GST compliant and automatically calculates all applicable taxes according to Indian GST regulations.'
                  : 'હા, અમારી સિસ્ટમ સંપૂર્ણપણે GST અનુપાલન છે અને ભારતીય GST નિયમો અનુસાર બધા લાગુ કરોને આપોઆપ ગણે છે.'
                }
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                {language === 'en' 
                  ? 'Can I use the system in both English and Gujarati?' 
                  : 'શું હું સિસ્ટમનો ઉપયોગ અંગ્રેજી અને ગુજરાતી બંનેમાં કરી શકું છું?'
                }
              </h3>
              <p className="text-neutral-600">
                {language === 'en' 
                  ? 'Absolutely! Our system supports both English and Gujarati languages, making it perfect for businesses serving diverse customers.'
                  : 'બિલકુલ! અમારી સિસ્ટમ અંગ્રેજી અને ગુજરાતી બંને ભાષાઓને સપોર્ટ કરે છે, જે વિવિધ ગ્રાહકોને સેવા આપતા બિઝનેસ માટે પરફેક્ટ છે.'
                }
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                {language === 'en' 
                  ? 'How secure is my business data?' 
                  : 'મારા બિઝનેસનો ડેટા કેટલો સુરક્ષિત છે?'
                }
              </h3>
              <p className="text-neutral-600">
                {language === 'en' 
                  ? 'We use enterprise-grade security with SSL encryption, regular backups, and secure cloud infrastructure to protect your data.'
                  : 'અમે તમારા ડેટાને સુરક્ષિત રાખવા માટે SSL એન્ક્રિપ્શન, નિયમિત બેકઅપ્સ અને સુરક્ષિત ક્લાઉડ ઇન્ફ્રાસ્ટ્રક્ચર સાથે એન્ટરપ્રાઇઝ-ગ્રેડ સિક્યોરિટીનો ઉપયોગ કરીએ છીએ.'
                }
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                {language === 'en' 
                  ? 'Can I customize the invoice templates?' 
                  : 'શું હું ઇન્વૉઇસ ટેમ્પલેટ્સને કસ્ટમાઇઝ કરી શકું છું?'
                }
              </h3>
              <p className="text-neutral-600">
                {language === 'en' 
                  ? 'Yes, our Professional and Enterprise plans include custom template options to match your brand identity.'
                  : 'હા, અમારા પ્રોફેશનલ અને એન્ટરપ્રાઇઝ પ્લાનમાં તમારી બ્રાન્ડ આઇડેન્ટિટીને મેચ કરવા માટે કસ્ટમ ટેમ્પલેટ વિકલ્પો શામેલ છે.'
                }
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                {language === 'en' 
                  ? 'Is there a mobile app available?' 
                  : 'શું મોબાઇલ એપ ઉપલબ્ધ છે?'
                }
              </h3>
              <p className="text-neutral-600">
                {language === 'en' 
                  ? 'Our web application is fully responsive and works perfectly on mobile devices. Native mobile apps are coming soon!'
                  : 'અમારી વેબ એપ્લિકેશન સંપૂર્ણપણે રિસ્પોન્સિવ છે અને મોબાઇલ ડિવાઇસ પર સંપૂર્ણ રીતે કામ કરે છે. નેટિવ મોબાઇલ એપ્સ ટૂંક સમયમાં આવી રહી છે!'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {language === 'en' ? 'Ready to Streamline Your Business?' : 'તમારા બિઝનેસને સરળ બનાવવા માટે તૈયાર છો?'}
          </h2>
          <p className="text-xl opacity-90 mb-8">
            {language === 'en' 
              ? "Join thousands of businesses already using our invoice management system"
              : "પહેલેથી જ અમારી ઇન્વૉઇસ મેનેજમેન્ટ સિસ્ટમનો ઉપયોગ કરી રહેલા હજારો બિઝનેસમાં જોડાઓ"
            }
          </p>
          
          <Link
            to="/dashboard"
            className="inline-flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <span className="mr-2">🚀</span>
            {language === 'en' ? 'Start Your Free Trial' : 'તમારો મફત ટ્રાયલ શરૂ કરો'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold">
                  📄
                </div>
                <span className="font-bold text-xl">
                  {language === 'en' ? 'Invoice Generator' : 'ઇન્વૉઇસ જનરેટર'}
                </span>
              </div>
              <p className="text-neutral-600">
                {language === 'en' 
                  ? "Simplifying business invoicing for everyone"
                  : "દરેક માટે બિઝનેસ ઇન્વૉઇસિંગને સરળ બનાવવું"
                }
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">
                {language === 'en' ? 'Features' : 'વિશેષતાઓ'}
              </h4>
              <ul className="space-y-2 text-neutral-600">
                <li>{language === 'en' ? 'Invoice Creation' : 'ઇન્વૉઇસ નિર્માણ'}</li>
                <li>{language === 'en' ? 'Customer Management' : 'ગ્રાહક વ્યવસ્થાપન'}</li>
                <li>{language === 'en' ? 'Payment Tracking' : 'ચુકવણી ટ્રેકિંગ'}</li>
                <li>{language === 'en' ? 'GST Compliance' : 'GST અનુપાલન'}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">
                {language === 'en' ? 'Support' : 'સપોર્ટ'}
              </h4>
              <ul className="space-y-2 text-neutral-600">
                <li>{language === 'en' ? 'Help Center' : 'હેલ્પ સેન્ટર'}</li>
                <li>{language === 'en' ? 'User Guide' : 'યુઝર ગાઇડ'}</li>
                <li>{language === 'en' ? 'Contact Us' : 'અમારો સંપર્ક કરો'}</li>
                <li>{language === 'en' ? 'FAQ' : 'FAQ'}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">
                {language === 'en' ? 'Company' : 'કંપની'}
              </h4>
              <ul className="space-y-2 text-neutral-600">
                <li>{language === 'en' ? 'About Us' : 'અમારા વિશે'}</li>
                <li>{language === 'en' ? 'Privacy Policy' : 'પ્રાઇવસી પોલિસી'}</li>
                <li>{language === 'en' ? 'Terms of Service' : 'સેવાની શરતો'}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 mt-8 pt-8 text-center text-neutral-600">
            <p>
              © 2025 {language === 'en' ? 'Invoice Generator. All rights reserved.' : 'ઇન્વૉઇસ જનરેટર. બધા અધિકારો સુરક્ષિત.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
