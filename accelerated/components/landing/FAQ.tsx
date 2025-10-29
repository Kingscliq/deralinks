'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQ() {
  const faqs = [
    {
      question: 'What is RWA tokenization?',
      answer:
        'Real World Asset (RWA) tokenization is the process of converting ownership rights in physical assets like real estate, art, or commodities into digital tokens (NFTs) on a blockchain. Each token represents a fraction of the asset, enabling fractional ownership and easier trading.',
    },
    {
      question: 'What is the minimum investment amount?',
      answer:
        'You can start investing with as little as ₦10,000. This low barrier to entry allows you to diversify across multiple premium assets that would traditionally require millions in capital.',
    },
    {
      question: 'How secure is my investment?',
      answer:
        'We employ bank-grade security including multi-signature wallets, institutional custody partners (Fireblocks), and full KYC/AML compliance. All transactions are recorded immutably on the Hedera blockchain, providing complete transparency.',
    },
    {
      question: 'Can I sell my tokens anytime?',
      answer:
        'Yes! Unlike traditional real estate investments, our secondary marketplace operates 24/7. You can list your tokens for sale at any time and benefit from instant settlement once a buyer is found.',
    },
    {
      question: 'How do I receive rental income?',
      answer:
        'For income-generating assets like rental properties, distributions are automated through smart contracts. Income is proportionally distributed to all token holders directly to their wallets on a scheduled basis (typically monthly or quarterly).',
    },
    {
      question: 'What are DAO governance rights?',
      answer:
        'Token holders can vote on important asset management decisions such as major repairs, property upgrades, or sale decisions. Your voting power is proportional to your token holdings, enabling true democratic asset management.',
    },
  ];

  return (
    <section id="faq" className="py-24 sm:py-32 bg-slate-950 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Everything you need to know about RWA tokenization
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-6 hover:border-blue-500/50 transition-colors duration-300"
              >
                <AccordionTrigger className="text-left text-lg text-white hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
