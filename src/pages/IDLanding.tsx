import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Key, Fingerprint, Lock, UserCheck, Globe, Smartphone, Mail, Bot, Code, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BRAND = "#fd4444";

const features = [
  {
    icon: Key,
    title: "Single Sign-On",
    description: "One identity across all Hanzo products. Login once, access everywhere.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 Type II compliant. Multi-factor authentication built-in.",
  },
  {
    icon: Fingerprint,
    title: "Passwordless Options",
    description: "WebAuthn, passkeys, and biometric authentication supported.",
  },
  {
    icon: Globe,
    title: "Social Login",
    description: "Connect with Google, GitHub, Discord, and 20+ providers.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Native SDKs for iOS and Android with seamless auth flows.",
  },
  {
    icon: Lock,
    title: "Privacy Focused",
    description: "GDPR compliant. Your data stays yours. Zero tracking.",
  },
];

const ecosystem = [
  {
    icon: Bot,
    title: "Hanzo Bot",
    description: "Deploy autonomous AI teams across every channel.",
    href: "https://hanzo.bot",
  },
  {
    icon: Code,
    title: "Hanzo Dev",
    description: "AI-powered development environment and code generation.",
    href: "https://hanzo.ai/dev",
  },
  {
    icon: Layers,
    title: "Hanzo Cloud",
    description: "Full-stack AI cloud platform with built-in IAM.",
    href: "https://cloud.hanzo.ai",
  },
  {
    icon: Zap,
    title: "Hanzo Chat",
    description: "Conversational AI with frontier models and tool use.",
    href: "https://hanzo.chat",
  },
];

const IDLanding = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-black" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${BRAND}15, transparent 70%)` }} />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm mb-8" style={{ background: `${BRAND}10`, borderColor: `${BRAND}30`, color: BRAND }}>
              <Key className="w-4 h-4" />
              Universal Identity
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              One Identity.
              <br />
              Everywhere.
            </h1>

            <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Unified authentication across the Hanzo ecosystem.
              Secure, seamless, and privacy-first.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a href="/login">
                <Button size="lg" className="text-white font-semibold px-8" style={{ background: BRAND }}>
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <a href="/signup">
                <Button size="lg" variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                  Create Account
                </Button>
              </a>
            </div>

            {/* Auth providers */}
            <div className="flex items-center justify-center gap-6 text-neutral-500">
              <span className="text-sm">Sign in with:</span>
              <div className="flex gap-3">
                <a href="/login" className="w-10 h-10 rounded-lg bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center hover:bg-neutral-700 hover:border-neutral-600 transition-colors" title="Email">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="/login" className="w-10 h-10 rounded-lg bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center hover:bg-neutral-700 hover:border-neutral-600 transition-colors" title="Social Login">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="/login" className="w-10 h-10 rounded-lg bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center hover:bg-neutral-700 hover:border-neutral-600 transition-colors" title="SSO">
                  <UserCheck className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-neutral-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Authentication Done Right</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Enterprise-grade identity management with developer-friendly APIs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-[#fd4444]/40 transition-colors"
              >
                <feature.icon className="w-10 h-10 mb-4" style={{ color: BRAND }} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">One Login. Every Product.</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Your Hanzo ID unlocks the entire ecosystem — AI agents, development tools, cloud infrastructure, and more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystem.map((product, index) => (
              <motion.a
                key={product.title}
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-[#fd4444]/40 transition-all hover:-translate-y-1"
              >
                <product.icon className="w-8 h-8 mb-3 text-neutral-400 group-hover:text-[#fd4444] transition-colors" />
                <h3 className="text-lg font-semibold mb-1">{product.title}</h3>
                <p className="text-sm text-neutral-400">{product.description}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-neutral-950">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-neutral-400 mb-8">
              Create your Hanzo ID in seconds. Free forever for individuals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup">
                <Button size="lg" className="text-white font-semibold px-8" style={{ background: BRAND }}>
                  Create Your Account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <a href="/login">
                <Button size="lg" variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                  Already have an account? Sign In
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IDLanding;
