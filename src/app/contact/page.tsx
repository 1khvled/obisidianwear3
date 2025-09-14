'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Mail, Phone, MapPin, Instagram, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-20 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider mb-6">
              GET IN TOUCH
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions about our products? Need help with an order? 
              We're here to help you with everything OBSIDIAN WEAR.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8 animate-fade-in-up delay-200">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-8">
                  CONTACT INFO
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 group">
                    <div className="p-3 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold uppercase tracking-wider">EMAIL</h3>
                      <p className="text-gray-400">contact@obsidianwear.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 group">
                    <div className="p-3 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Instagram className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold uppercase tracking-wider">INSTAGRAM</h3>
                      <p className="text-gray-400">@obsidianwear_dz</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 group">
                    <div className="p-3 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold uppercase tracking-wider">LOCATION</h3>
                      <p className="text-gray-400">Algeria</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-8 border-t border-gray-800">
                <h3 className="text-white font-bold uppercase tracking-wider mb-4">FOLLOW US</h3>
                <div className="flex space-x-4">
                  <a 
                    href="https://instagram.com/obsidianwear_dz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white text-black rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-300 hover:scale-110 transform"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-fade-in-up delay-400">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-8">
                SEND MESSAGE
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white font-bold uppercase tracking-wider mb-2">
                      NAME
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white text-black rounded-lg border-2 border-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-white font-bold uppercase tracking-wider mb-2">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white text-black rounded-lg border-2 border-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-white font-bold uppercase tracking-wider mb-2">
                    SUBJECT
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white text-black rounded-lg border-2 border-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-white font-bold uppercase tracking-wider mb-2">
                    MESSAGE
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white text-black rounded-lg border-2 border-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 resize-none"
                    placeholder="Tell us more..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-500 text-black py-4 px-6 font-black text-lg uppercase tracking-wider rounded-lg hover:bg-purple-600 transition-all duration-300 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      SENDING...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      SEND MESSAGE
                    </>
                  )}
                </button>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-center">
                    Message sent successfully! We'll get back to you soon.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-center">
                    Failed to send message. Please try again.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
