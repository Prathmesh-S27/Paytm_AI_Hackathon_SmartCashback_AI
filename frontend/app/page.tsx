import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Brain, MapPin, Sparkles, TrendingUp, Users, Store } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute inset-0 top-[-20%] z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-slate-900/0" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full" />
        </div>
        
        <div className="relative z-10 animate-slideUp">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-indigo-400 mb-8 backdrop-blur-md">
            <Sparkles size={16} />
            <span className="text-sm font-medium">Merchant Cashback MVP</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            Smart Cashback, <br />
            <span className="text-gradient">Hyperlocal Rewards</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            AI-powered, category-aware recommendations that connect customers with local merchants they'll love.
          </p>
          
          <Link href="/login">
            <Button size="lg" className="animate-pulse-glow">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          <Card gradientBorder className="p-8 text-center animate-slideUp animate-delay-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto mb-6">
              <Brain size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Category Intelligence</h3>
            <p className="text-slate-400">Understands your spending habits across 25+ categories to predict what you need next.</p>
          </Card>
          
          <Card gradientBorder className="p-8 text-center animate-slideUp animate-delay-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto mb-6">
              <MapPin size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Hyperlocal Discovery</h3>
            <p className="text-slate-400">Finds the best merchants within your radius, prioritizing convenience.</p>
          </Card>
          
          <Card gradientBorder className="p-8 text-center animate-slideUp animate-delay-300">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mx-auto mb-6">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">AI-Powered Rewards</h3>
            <p className="text-slate-400">Dynamically calculates cashback based on user history, merchant quality, and price similarity.</p>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-slate-800/30 border-y border-slate-700/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-slate-50 mb-2 flex justify-center items-center gap-2">
              <Users className="text-indigo-400" /> 100+
            </div>
            <div className="text-slate-400">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-50 mb-2 flex justify-center items-center gap-2">
              <Store className="text-emerald-400" /> 80+
            </div>
            <div className="text-slate-400">Local Merchants</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-50 mb-2">25</div>
            <div className="text-slate-400">Categories</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-50 mb-2">2000+</div>
            <div className="text-slate-400">Transactions</div>
          </div>
        </div>
      </section>
    </main>
  );
}
