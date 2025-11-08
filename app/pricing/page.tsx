import Link from 'next/link';
import { Check } from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';
import Footer from '@/components/shared/Footer';

const pricingPlans = [
  {
    name: 'Free',
    price: '0',
    period: 'month',
    description: 'Perfect for getting started',
    features: [
      'Track up to 5 products',
      'Basic analytics dashboard',
      'Email notifications',
      'Community support',
      'Standard scraping frequency'
    ],
    limitations: [
      'Limited AI insights (10/month)',
      'No competitor analysis',
      'Basic reporting'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline' as const,
    popular: false
  },
  {
    name: 'Pro',
    price: '299,000',
    period: 'month',
    description: 'For serious sellers and businesses',
    features: [
      'Track up to 50 products',
      'Advanced AI analytics',
      'Real-time competitor tracking',
      'Custom alerts & notifications',
      'Priority support',
      'API access',
      'Advanced reporting & insights',
      'Bulk product management'
    ],
    limitations: [],
    buttonText: 'Start Pro Trial',
    buttonVariant: 'default' as const,
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Contact us',
    period: '',
    description: 'For large-scale operations',
    features: [
      'Unlimited product tracking',
      'Custom AI models',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced analytics suite',
      '24/7 phone support',
      'SLA guarantees'
    ],
    limitations: [],
    buttonText: 'Contact Sales',
    buttonVariant: 'outline' as const,
    popular: false
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <LandingHeader />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the power of AI-driven e-commerce analytics. Track competitors,
            optimize pricing, and boost your sales with data-driven insights.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 'Contact us' ? plan.price : `${plan.price} VNĐ`}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}

                  {plan.limitations.map((limitation, limitIdx) => (
                    <div key={limitIdx} className="flex items-center">
                      <span className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 text-sm">✗</span>
                      <span className="text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.name === 'Free' ? '/auth/signup' : '/contact'}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all block text-center ${
                    plan.buttonVariant === 'default'
                      ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
                      : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately,
                and we&apos;ll prorate any charges.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What platforms do you support?
              </h3>
              <p className="text-gray-600">
                We currently support Shopee, Lazada, TikTok Shop, and Tiki.
                More platforms are being added regularly.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial for Pro plan?
              </h3>
              <p className="text-gray-600">
                Yes! You can try Pro plan free for 14 days. No credit card required to start.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How accurate is the AI analysis?
              </h3>
              <p className="text-gray-600">
                Our AI models are trained on millions of e-commerce data points and provide
                high-accuracy insights with confidence scores for each recommendation.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Boost Your Sales?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of sellers who are already using AI to optimize their e-commerce strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
