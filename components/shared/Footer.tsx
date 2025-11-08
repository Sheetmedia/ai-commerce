import Link from 'next/link';
import { Zap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">AI Commerce</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              E-commerce analytics powered by AI. Smarter than Metric.vn.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
              <li><Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2025 AI Commerce. Made with AI in Vietnam.
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 text-slate-400 text-sm">
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/security" className="hover:text-white transition-colors">Security</Link>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>hello@ai-commerce.vn</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+84 28 1234 5678</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
