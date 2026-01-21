import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Key, Fingerprint, Lock, UserCheck, Globe, Smartphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const IDLanding = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-8">
              <Key className="w-4 h-4" />
              Universal Identity
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              One Identity.
              <br />
              Everywhere.
            </h1>

            <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Unified authentication across the Hanzo ecosystem.
              Secure, seamless, and privacy-first.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8">
                Sign In
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                Create Account
              </Button>
            </div>

            {/* Auth providers */}
            <div className="flex items-center justify-center gap-6 text-neutral-500">
              <span className="text-sm">Sign in with:</span>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 cursor-pointer transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 cursor-pointer transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 cursor-pointer transition-colors">
                  <UserCheck className="w-5 h-5" />
                </div>
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
                className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/50 transition-colors"
              >
                <feature.icon className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-neutral-400 mb-8">
              Join thousands of developers building with Hanzo ID.
            </p>
            <Button size="lg" className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8">
              Create Your Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IDLanding;
