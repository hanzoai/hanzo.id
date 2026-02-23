import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Search,
  Zap,
  MessageSquare,
  Database,
  Cloud,
  Users,
  ShoppingCart,
  BarChart3,
  Mail,
  Calendar,
  FileText,
  Code,
  Bot,
  Palette,
  Share2,
  CreditCard,
  Phone,
  Video,
  Globe,
  ExternalLink,
} from "lucide-react";

const BRAND_COLOR = "#ffffff";

// Integration categories
const categories = [
  { id: "all", name: "All", icon: Zap },
  { id: "ai", name: "AI & LLMs", icon: Bot },
  { id: "communication", name: "Communication", icon: MessageSquare },
  { id: "productivity", name: "Productivity", icon: FileText },
  { id: "data", name: "Data & Storage", icon: Database },
  { id: "crm", name: "CRM & Sales", icon: Users },
  { id: "commerce", name: "Commerce", icon: ShoppingCart },
  { id: "marketing", name: "Marketing", icon: Mail },
  { id: "developer", name: "Developer Tools", icon: Code },
  { id: "social", name: "Social Media", icon: Share2 },
];

// Featured integrations with icons and colors
const integrations = [
  // AI & LLMs
  { name: "OpenAI", category: "ai", icon: "🤖", color: "#a3a3a3", popular: true },
  { name: "Anthropic Claude", category: "ai", icon: "🧠", color: "#737373", popular: true },
  { name: "Google Gemini", category: "ai", icon: "✨", color: "#d4d4d4", popular: true },
  { name: "Azure OpenAI", category: "ai", icon: "☁️", color: "#525252" },
  { name: "Hugging Face", category: "ai", icon: "🤗", color: "#b3b3b3" },
  { name: "Replicate", category: "ai", icon: "🔄", color: "#000000" },
  { name: "Stability AI", category: "ai", icon: "🎨", color: "#8a8a8a" },
  { name: "ElevenLabs", category: "ai", icon: "🔊", color: "#000000" },
  { name: "Deepgram", category: "ai", icon: "🎙️", color: "#e5e5e5" },

  // Communication
  { name: "Slack", category: "communication", icon: "💬", color: "#525252", popular: true },
  { name: "Discord", category: "communication", icon: "🎮", color: "#737373", popular: true },
  { name: "Telegram", category: "communication", icon: "✈️", color: "#a3a3a3" },
  { name: "WhatsApp", category: "communication", icon: "📱", color: "#d4d4d4", popular: true },
  { name: "Microsoft Teams", category: "communication", icon: "👥", color: "#8a8a8a" },
  { name: "Twilio", category: "communication", icon: "📞", color: "#b3b3b3" },
  { name: "Zoom", category: "communication", icon: "📹", color: "#666666" },
  { name: "Google Chat", category: "communication", icon: "💭", color: "#e5e5e5" },

  // Productivity
  { name: "Notion", category: "productivity", icon: "📝", color: "#000000", popular: true },
  { name: "Airtable", category: "productivity", icon: "📊", color: "#a3a3a3", popular: true },
  { name: "Google Sheets", category: "productivity", icon: "📗", color: "#d4d4d4", popular: true },
  { name: "Google Docs", category: "productivity", icon: "📄", color: "#b3b3b3" },
  { name: "Google Drive", category: "productivity", icon: "📁", color: "#737373", popular: true },
  { name: "Dropbox", category: "productivity", icon: "📦", color: "#525252" },
  { name: "Calendly", category: "productivity", icon: "📅", color: "#8a8a8a" },
  { name: "Google Calendar", category: "productivity", icon: "🗓️", color: "#e5e5e5" },
  { name: "Trello", category: "productivity", icon: "📋", color: "#666666" },
  { name: "Asana", category: "productivity", icon: "✅", color: "#a3a3a3" },
  { name: "ClickUp", category: "productivity", icon: "🎯", color: "#d4d4d4" },
  { name: "Linear", category: "productivity", icon: "📐", color: "#737373", popular: true },
  { name: "Jira", category: "productivity", icon: "🔷", color: "#525252" },

  // Data & Storage
  { name: "PostgreSQL", category: "data", icon: "🐘", color: "#525252" },
  { name: "MySQL", category: "data", icon: "🐬", color: "#737373" },
  { name: "MongoDB", category: "data", icon: "🍃", color: "#a3a3a3" },
  { name: "Redis", category: "data", icon: "🔴", color: "#b3b3b3" },
  { name: "Supabase", category: "data", icon: "⚡", color: "#d4d4d4" },
  { name: "Firebase", category: "data", icon: "🔥", color: "#8a8a8a" },
  { name: "AWS S3", category: "data", icon: "☁️", color: "#e5e5e5" },
  { name: "Google Cloud Storage", category: "data", icon: "☁️", color: "#666666" },
  { name: "Snowflake", category: "data", icon: "❄️", color: "#a3a3a3" },
  { name: "BigQuery", category: "data", icon: "📊", color: "#737373" },

  // CRM & Sales
  { name: "Salesforce", category: "crm", icon: "☁️", color: "#a3a3a3", popular: true },
  { name: "HubSpot", category: "crm", icon: "🧡", color: "#b3b3b3", popular: true },
  { name: "Pipedrive", category: "crm", icon: "📈", color: "#1A1B1D" },
  { name: "Close", category: "crm", icon: "📞", color: "#252A3D" },
  { name: "Intercom", category: "crm", icon: "💬", color: "#737373" },
  { name: "Zendesk", category: "crm", icon: "🎧", color: "#525252" },
  { name: "Freshdesk", category: "crm", icon: "🎫", color: "#d4d4d4" },
  { name: "Apollo", category: "crm", icon: "🚀", color: "#8a8a8a" },

  // Commerce
  { name: "Stripe", category: "commerce", icon: "💳", color: "#737373", popular: true },
  { name: "Shopify", category: "commerce", icon: "🛒", color: "#a3a3a3", popular: true },
  { name: "WooCommerce", category: "commerce", icon: "🛍️", color: "#666666" },
  { name: "Square", category: "commerce", icon: "⬜", color: "#3E4348" },
  { name: "PayPal", category: "commerce", icon: "💰", color: "#525252" },
  { name: "Chargebee", category: "commerce", icon: "💵", color: "#b3b3b3" },
  { name: "Paddle", category: "commerce", icon: "🏓", color: "#3F3F46" },
  { name: "LemonSqueezy", category: "commerce", icon: "🍋", color: "#d4d4d4" },

  // Marketing
  { name: "Mailchimp", category: "marketing", icon: "🐵", color: "#d4d4d4", popular: true },
  { name: "SendGrid", category: "marketing", icon: "📧", color: "#737373" },
  { name: "Resend", category: "marketing", icon: "✉️", color: "#000000" },
  { name: "ConvertKit", category: "marketing", icon: "📬", color: "#a3a3a3" },
  { name: "ActiveCampaign", category: "marketing", icon: "📊", color: "#525252" },
  { name: "Brevo", category: "marketing", icon: "📨", color: "#8a8a8a" },
  { name: "Customer.io", category: "marketing", icon: "👤", color: "#b3b3b3" },
  { name: "Postmark", category: "marketing", icon: "📮", color: "#e5e5e5" },

  // Developer Tools
  { name: "GitHub", category: "developer", icon: "🐙", color: "#181717", popular: true },
  { name: "GitLab", category: "developer", icon: "🦊", color: "#a3a3a3" },
  { name: "Vercel", category: "developer", icon: "▲", color: "#000000" },
  { name: "Netlify", category: "developer", icon: "🌐", color: "#d4d4d4" },
  { name: "Railway", category: "developer", icon: "🚂", color: "#0B0D0E" },
  { name: "Render", category: "developer", icon: "🎨", color: "#b3b3b3" },
  { name: "Sentry", category: "developer", icon: "🐛", color: "#525252" },
  { name: "PagerDuty", category: "developer", icon: "🚨", color: "#737373" },
  { name: "Datadog", category: "developer", icon: "🐕", color: "#666666" },

  // Social Media
  { name: "Twitter / X", category: "social", icon: "𝕏", color: "#000000" },
  { name: "LinkedIn", category: "social", icon: "🔗", color: "#737373", popular: true },
  { name: "Instagram", category: "social", icon: "📸", color: "#a3a3a3" },
  { name: "Facebook", category: "social", icon: "📘", color: "#525252" },
  { name: "TikTok", category: "social", icon: "🎵", color: "#000000" },
  { name: "YouTube", category: "social", icon: "▶️", color: "#b3b3b3" },
  { name: "Pinterest", category: "social", icon: "📌", color: "#8a8a8a" },
  { name: "Bluesky", category: "social", icon: "🦋", color: "#d4d4d4" },
];

const Automations = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory = activeCategory === "all" || integration.category === activeCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularIntegrations = integrations.filter((i) => i.popular);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ duration: 1.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
              style={{
                background: `radial-gradient(circle, ${BRAND_COLOR} 0%, transparent 70%)`,
                filter: "blur(100px)",
              }}
            />
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <p
                className="inline-flex text-xs font-medium rounded-full px-4 py-2 border mb-6"
                style={{ color: BRAND_COLOR, borderColor: `${BRAND_COLOR}4d` }}
              >
                Integrations & Automation
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6">
                <span className="text-white">Connect with</span>{" "}
                <span style={{ color: BRAND_COLOR }}>500+ apps</span>
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-8">
                Hanzo Automations connects your AI agents to the tools you use every day. Build powerful workflows without code.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffffff]/50 transition-colors"
                />
              </div>
            </motion.div>

            {/* Popular Integrations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-16"
            >
              <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4 text-center">
                Popular Integrations
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {popularIntegrations.slice(0, 12).map((integration) => (
                  <motion.a
                    key={integration.name}
                    href={`#${integration.name.toLowerCase().replace(/\s+/g, "-")}`}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
                  >
                    <span className="text-lg">{integration.icon}</span>
                    <span className="text-sm text-white">{integration.name}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 px-4 md:px-8 border-y border-neutral-800 bg-neutral-950 sticky top-16 z-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-[#ffffff] text-white"
                        : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Integrations Grid */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium text-white">
                {activeCategory === "all"
                  ? "All Integrations"
                  : categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <span className="text-sm text-neutral-500">
                {filteredIntegrations.length} integrations
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredIntegrations.map((integration, index) => (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="group p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-700 transition-all cursor-pointer"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
                    style={{ backgroundColor: integration.color + "20" }}
                  >
                    {integration.icon}
                  </div>
                  <h3 className="text-sm font-medium text-white group-hover:text-[#ffffff] transition-colors">
                    {integration.name}
                  </h3>
                  {integration.popular && (
                    <span className="text-[10px] text-[#ffffff] font-medium">Popular</span>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredIntegrations.length === 0 && (
              <div className="text-center py-16">
                <p className="text-neutral-500">No integrations found matching your search.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-8 border-t border-neutral-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">
              Don't see your app?
            </h2>
            <p className="text-lg text-neutral-400 mb-8">
              We add new integrations every week. Request an integration or build your own with our SDK.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 rounded-full font-medium transition-all hover:opacity-90 text-sm"
                style={{ backgroundColor: BRAND_COLOR, color: "#000000" }}
              >
                Request Integration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="https://docs.hanzo.ai/automations/sdk"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center px-6 py-3 rounded-full font-medium transition-colors border border-neutral-700 bg-transparent hover:bg-neutral-900 text-sm text-white"
              >
                Build Custom Integration
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Automations;
