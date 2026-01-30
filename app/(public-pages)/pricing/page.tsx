'use client';

import Link from 'next/link';

const pricingPlans = [
  {
    name: "Starter",
    price: "₹4,999",
    originalPrice: "₹9,999",
    period: "/mo",
    description: "For D2C brands & small teams",
    features: [
      "50 vibeAI™ Analyses/month",
      "AI Fake Follower Detection",
      "3 Year History Analysis",
      "Email & Chat Support",
      "Up to 3 team members",
    ],
  },
  {
    name: "Growth",
    price: "₹14,999",
    originalPrice: "₹29,999",
    period: "/mo",
    description: "For agencies & mid-size brands",
    featured: true,
    features: [
      "250 vibeAI™ Analyses/month",
      "Advanced Brand Safety AI",
      "Complete History Analysis",
      "Priority Support + CSM",
      "Custom Brand DNA Profile",
      "Auto-negotiation AI",
      "Up to 10 team members",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large brands & agencies",
    features: [
      "Unlimited vibeAI™ Analyses",
      "White-label Solution",
      "Dedicated AI Engineer",
      "Custom AI Model Training",
      "SLA Guarantee (99.9%)",
      "API Access & Integrations",
      "Unlimited team members",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="landing-page">
      <div className="bg-grid" />
      <div className="floating-elements">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
      </div>

      <section className="pricing-section" id="pricing" style={{ paddingTop: '100px' }}>
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-gradient">Simple Pricing</span>
            </h2>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card glass ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && (
                  <div className="popular-tag">
                    <i className="fa-solid fa-star" />
                    <span>Most Popular</span>
                  </div>
                )}
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-desc">{plan.description}</p>
                </div>

                <div className="plan-price">
                  {plan.originalPrice && (
                    <span className="original-price">{plan.originalPrice}</span>
                  )}
                  <span className="current-price">
                    {plan.price}
                  </span>
                  <span className="price-period">{plan.period}</span>
                </div>

                {plan.originalPrice && (
                  <div className="discount-badge">
                    <i className="fa-solid fa-tag" />
                    <span>50% Beta Discount</span>
                  </div>
                )}

                <ul className="plan-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <i className="fa-solid fa-check" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href={plan.featured ? '/register?plan=growth' : plan.name === 'Enterprise' ? '/book-demo' : '/register'} 
                  className={`plan-cta ${plan.featured ? 'glow-btn' : 'glass'}`}
                >
                  <span>{plan.price === 'Custom' ? 'Contact Us' : 'Join Beta'}</span>
                  <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
