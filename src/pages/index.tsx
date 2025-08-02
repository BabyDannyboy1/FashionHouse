import Link from 'next/link';
import { 
  Crown, 
  Shirt, 
  Users, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  ArrowRight, 
  CheckCircle, 
  Sparkles 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LandingPage() {
  const [formData, setFormData] = useState({ name: '', email: '', service: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.name || !formData.email || !formData.service || !formData.message) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      setSuccess('Message sent successfully!');
      setFormData({ name: '', email: '', service: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Try again.');
    }
  };

  const vogueImages = [
    '/images/assets/IMG-20250704-WA0039.jpg',
    '/images/assets/IMG-20250704-WA0040.jpg',
    '/images/assets/IMG-20250704-WA0041.jpg',
  ];

  const VogueSlider: React.FC = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % vogueImages.length);
      }, 3000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="relative w-full h-72">
        {vogueImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Vogue ${i + 1}`}
            className={`absolute top-0 left-0 w-full h-72 object-cover rounded-2xl transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            style={{ transitionProperty: 'opacity' }}
          />
        ))}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {vogueImages.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i === index ? 'bg-gold-400' : 'bg-gray-400/50'} transition-all`}
            />
          ))}
        </div>
      </div>
    );
  };

  const heroBgImages = [
    '/images/assets/IMG-20250704-WA0036.jpg',
    '/images/assets/IMG-20250704-WA0037.jpg',
    '/images/assets/IMG-20250704-WA0038.jpg',
  ];

  const HeroBgSlider: React.FC = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % heroBgImages.length);
      }, 4000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="absolute inset-0 w-full h-full">
        {heroBgImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Hero Slide ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === index ? 'opacity-30 z-10' : 'opacity-0 z-0'}`}
            style={{ transitionProperty: 'opacity' }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-sm border-b border-gold-500/30 sticky top-0 z-50 shadow-lg shadow-gold-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Image
                  src="/images/logo.png"
                  alt="Jeca Kings Garment Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                  priority
                />
                {/* Decorative overlay replaced with logo */}
                <div className="absolute inset-0 h-8 w-8 opacity-50 pointer-events-none">
                  <Image
                    src="/images/assets/jeca_logo.png"
                    alt="Jeca Kings Garment Decorative Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain animate-pulse"
                    priority
                  />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent drop-shadow-lg">
                Jeca Kings Garment
              </span>
            </div>
            <nav className="hidden md:flex space-x-8 items-center">
              <a href="#services" className="text-gray-300 hover:text-gold-400 transition-all duration-300 font-medium hover:drop-shadow-lg">Services</a>
              <a href="#about" className="text-gray-300 hover:text-gold-400 transition-all duration-300 font-medium hover:drop-shadow-lg">About</a>
              <a href="#gallery" className="text-gray-300 hover:text-gold-400 transition-all duration-300 font-medium hover:drop-shadow-lg">Gallery</a>
              <a href="#contact" className="text-gray-300 hover:text-gold-400 transition-all duration-300 font-medium hover:drop-shadow-lg">Contact</a>
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-gold-400 to-gold-600 text-black px-6 py-2 rounded-full font-bold hover:from-gold-300 hover:to-gold-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gold-500/30 hover:shadow-gold-400/50"
              >
                Client Portal
              </Link>
            </nav>
            <div className="md:hidden">
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-gold-400 to-gold-600 text-black px-4 py-2 rounded-full font-bold text-sm"
              >
                Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
        <HeroBgSlider />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-gold-500 rounded-full animate-ping opacity-40"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-gold-300 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-gold-600 rounded-full animate-ping opacity-50"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <div className="relative inline-block">
              {/* Decorative logo in hero - bigger size */}
              <Image
                src="/images/assets/jeca_logo.png"
                alt="Jeca Kings Garment Decorative Logo"
                width={128}
                height={128}
                className="h-64 w-64 object-contain animate-pulse mx-auto mb-4 drop-shadow-2xl"
                priority
              />
              <div className="absolute inset-0 h-32 w-32 opacity-30 pointer-events-none animate-ping">
                <Image
                  src="/images/assets/jeca_logo.png"
                  alt="Jeca Kings Garment Decorative Logo Glow"
                  width={128}
                  height={128}
                  className="h-64 w-64 object-contain"
                  priority
                />
              </div>
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gold-300 via-gold-500 to-gold-700 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
              Jeca Kings
            </span>
            <br />
            <span className="bg-gradient-to-r from-gold-600 via-gold-400 to-gold-500 bg-clip-text text-transparent drop-shadow-2xl">
              Garment
            </span>
          </h1>
          <p className="text-xl md:text-3xl text-gray-200 mb-10 leading-relaxed font-light drop-shadow-lg">
            Where <span className="text-gold-400 font-semibold">Tradition</span> Meets <span className="text-gold-400 font-semibold">Elegance</span>
            <br />
            Crafting Premium Fashion for the Modern Royalty
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/login"
              className="group bg-gradient-to-r from-gold-400 to-gold-600 text-black px-10 py-5 rounded-full font-bold text-xl hover:from-gold-300 hover:to-gold-500 transition-all duration-300 transform hover:scale-110 flex items-center justify-center shadow-2xl shadow-gold-500/40 hover:shadow-gold-400/60"
            >
              Access Client Portal
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#services"
              className="border-2 border-gold-500 text-gold-400 px-10 py-5 rounded-full font-bold text-xl hover:bg-gradient-to-r hover:from-gold-500 hover:to-gold-600 hover:text-black transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gold-500/20"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent drop-shadow-lg">
                Our Premium Services
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              From traditional attires to modern fashion, we create <span className="text-gold-400 font-semibold">masterpieces</span> that reflect your unique style and heritage.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Traditional Attires",
                description: "Authentic cultural garments crafted with precision and respect for tradition.",
                icon: <Crown className="h-16 w-16 text-gold-500 drop-shadow-lg" />,
                image: "/images/assets/IMG-20250704-WA0029.jpg"
              },
              {
                title: "Premium Suits",
                description: "Tailored suits that embody sophistication and contemporary elegance.",
                icon: <Shirt className="h-16 w-16 text-gold-500 drop-shadow-lg" />,
                image: "/images/assets/IMG-20250704-WA0023.jpg"
              },
              {
                title: "Fashion Accessories",
                description: "Exquisite accessories that complement and complete your royal look.",
                icon: <Sparkles className="h-16 w-16 text-gold-500 drop-shadow-lg" />,
                image: "/images/assets/IMG-20250704-WA0024.jpg"
              },
              {
                title: "Footwears",
                description: "Handcrafted footwear that combines comfort with unmatched style.",
                icon: <Star className="h-16 w-16 text-gold-500 drop-shadow-lg" />,
                image: "/images/assets/IMG-20250704-WA0025.jpg"
              }
            ].map((service, index) => (
              <div key={index} className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 via-gray-900 to-black hover:from-gray-700 hover:to-gray-800 transition-all duration-500 transform hover:scale-105 border border-gold-500/20 hover:border-gold-400/40 shadow-xl hover:shadow-2xl hover:shadow-gold-500/20">
                <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-gold-400 mb-3 drop-shadow-lg">{service.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section (VogueSlider) */}
      <section id="gallery" className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent drop-shadow-lg">
                Our Creations
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Discover the artistry behind our <span className="text-gold-400 font-semibold">exclusive designs</span>, crafted to inspire and captivate.
            </p>
          </div>
          <VogueSlider />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
                <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent drop-shadow-lg">
                  Crafting Excellence
                </span>
                <br />
                <span className="text-white">Since Day One</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                At <span className="text-gold-400 font-semibold">Jeca Kings Garment</span>, we believe that every piece of clothing tells a story. Our master craftsmen 
                combine traditional techniques with modern innovation to create garments that are not just worn, 
                but <span className="text-gold-400 font-semibold">experienced</span>.
              </p>
              <div className="space-y-6">
                {[
                  "Premium quality materials sourced globally",
                  "Expert tailoring with attention to detail",
                  "Custom designs for every occasion",
                  "Heritage-inspired contemporary fashion"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <CheckCircle className="h-8 w-8 text-gold-500 flex-shrink-0 drop-shadow-lg" />
                    <span className="text-gray-300 text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="/images/assets/IMG-20250704-WA0046.jpg"
                alt="Craftsmanship"
                className="rounded-3xl shadow-2xl border border-gold-500/20"
              />
              <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-gold-400 to-gold-600 text-black p-8 rounded-3xl shadow-2xl shadow-gold-500/40">
                <div className="text-center">
                  <div className="text-4xl font-black">1000+</div>
                  <div className="text-lg font-bold">Happy Clients</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent drop-shadow-lg">
                Get In Touch
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300">Ready to create your masterpiece? Let's start the conversation.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="flex items-start space-x-6 group">
                <div className="bg-gradient-to-r from-gold-400 to-gold-600 p-4 rounded-2xl shadow-lg shadow-gold-500/30 group-hover:shadow-gold-400/50 transition-all duration-300">
                  <MapPin className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gold-400 mb-3">Visit Our Atelier</h3>
                  <p className="text-gray-300 text-lg">13 Kwara Street, Egbeda Akowonjo</p>
                  <p className="text-gray-400">Lagos, Nigeria</p>
                </div>
              </div>
              <div className="flex items-start space-x-6 group">
                <div className="bg-gradient-to-r from-gold-400 to-gold-600 p-4 rounded-2xl shadow-lg shadow-gold-500/30 group-hover:shadow-gold-400/50 transition-all duration-300">
                  <Phone className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gold-400 mb-3">Call Us</h3>
                  <p className="text-gray-300 text-lg">+234 703 323 0006</p>
                  <p className="text-gray-300 text-lg">+234 813 704 4482</p>
                </div>
              </div>
              <div className="flex items-start space-x-6 group">
                <div className="bg-gradient-to-r from-gold-400 to-gold-600 p-4 rounded-2xl shadow-lg shadow-gold-500/30 group-hover:shadow-gold-400/50 transition-all duration-300">
                  <Mail className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gold-400 mb-3">Email Us</h3>
                  <p className="text-gray-300 text-lg">info@jecakingsgarment.com</p>
                </div>
              </div>
              <div className="pt-8">
                <h3 className="text-2xl font-bold text-gold-400 mb-6">Follow Our Journey</h3>
                <div className="flex space-x-6">
                  <a 
                    href="https://instagram.com/JECA_KINGSGARMENT" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-gold-400 to-gold-600 text-black p-4 rounded-2xl hover:from-gold-300 hover:to-gold-500 transition-all duration-300 transform hover:scale-110 shadow-lg shadow-gold-500/30 hover:shadow-gold-400/50"
                  >
                    <Instagram className="h-8 w-8" />
                  </a>
                  <a 
                    href="https://facebook.com/jeca.kingsgarment" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-gold-400 to-gold-600 text-black p-4 rounded-2xl hover:from-gold-300 hover:to-gold-500 transition-all duration-300 transform hover:scale-110 shadow-lg shadow-gold-500/30 hover:shadow-gold-400/50"
                  >
                    <Facebook className="h-8 w-8" />
                  </a>
                  <a 
                    href="https://tiktok.com/@JECA_KINGSGARMENT" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-gold-400 to-gold-600 text-black p-4 rounded-2xl hover:from-gold-300 hover:to-gold-500 transition-all duration-300 transform hover:scale-110 shadow-lg shadow-gold-500/30 hover:shadow-gold-400/50"
                  >
                    <Users className="h-8 w-8" />
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-10 rounded-3xl border border-gold-500/20 shadow-2xl">
              <h3 className="text-3xl font-bold text-gold-400 mb-8 drop-shadow-lg">Start Your Custom Order</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                <div>
                  <input 
                    type="text" 
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-700/50 border border-gold-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/20 transition-all duration-300 text-lg"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-700/50 border border-gold-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/20 transition-all duration-300 text-lg"
                  />
                </div>
                <div>
                  <select 
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-700/50 border border-gold-500/30 rounded-xl text-white focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/20 transition-all duration-300 text-lg"
                  >
                    <option value="">Select Service</option>
                    <option value="traditional">Traditional Attires</option>
                    <option value="suits">Premium Suits</option>
                    <option value="accessories">Fashion Accessories</option>
                    <option value="footwear">Footwears</option>
                  </select>
                </div>
                <div>
                  <textarea 
                    rows={4}
                    placeholder="Tell us about your vision..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-700/50 border border-gold-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/20 transition-all duration-300 resize-none text-lg"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-black py-4 rounded-xl font-bold text-lg hover:from-gold-300 hover:to-gold-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gold-500/30 hover:shadow-gold-400/50"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-black to-gray-900 border-t border-gold-500/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <Image
                  src="/images/logo.png"
                  alt="Jeca Kings Garment Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                  priority
                />
                {/* Decorative overlay replaced with logo */}
                <div className="absolute inset-0 h-10 w-10 opacity-50 pointer-events-none">
                  <Image
                    src="/images/assets/jeca_logo.png"
                    alt="Jeca Kings Garment Decorative Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain animate-pulse"
                    priority
                  />
                </div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent drop-shadow-lg">
                Jeca Kings Garment
              </span>
            </div>
            <p className="text-gray-400 mb-8 text-lg">Crafting Excellence, Defining Elegance</p>
            <div className="flex justify-center space-x-8 mb-10">
              <a href="#services" className="text-gray-400 hover:text-gold-400 transition-all duration-300 font-medium text-lg">Services</a>
              <a href="#about" className="text-gray-400 hover:text-gold-400 transition-all duration-300 font-medium text-lg">About</a>
              <a href="#gallery" className="text-gray-400 hover:text-gold-400 transition-all duration-300 font-medium text-lg">Gallery</a>
              <a href="#contact" className="text-gray-400 hover:text-gold-400 transition-all duration-300 font-medium text-lg">Contact</a>
              <Link href="/login" className="text-gray-400 hover:text-gold-400 transition-all duration-300 font-medium text-lg">Client Portal</Link>
            </div>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500">
                © 2025 Jeca Kings Garment. All rights reserved. | Crafted with excellence in Lagos, Nigeria.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}