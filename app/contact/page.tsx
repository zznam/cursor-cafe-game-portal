"use client";

import {useState} from "react";
import {
  Mail,
  MessageSquare,
  Github,
  Twitter,
  Send,
  CheckCircle,
} from "lucide-react";
import {Button} from "@/components/ui/button";

const CONTACT_CHANNELS = [
  {
    icon: Github,
    label: "GitHub",
    desc: "Report bugs & request features",
    href: "https://github.com/zznam/cursor-cafe-game-portal/issues",
    color: "text-white bg-white/10",
  },
  {
    icon: Twitter,
    label: "Twitter / X",
    desc: "Follow for updates & news",
    href: "https://twitter.com",
    color: "text-sky-400 bg-sky-500/10",
  },
  {
    icon: Mail,
    label: "Email",
    desc: "hello@cursorcafe.dev",
    href: "mailto:hello@cursorcafe.dev",
    color: "text-purple-400 bg-purple-500/10",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API endpoint
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/70 font-medium">
              Get in Touch
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
            Contact Us
          </h1>
          <p className="text-lg text-white/60 max-w-lg mx-auto">
            Have a question, suggestion, or just want to say hi? We&apos;d love
            to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Channels */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Reach out via
            </h2>
            {CONTACT_CHANNELS.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className={`p-3 rounded-lg ${channel.color}`}>
                  <channel.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-medium group-hover:text-purple-300 transition-colors">
                    {channel.label}
                  </div>
                  <div className="text-sm text-white/50">{channel.desc}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Message Sent!
                  </h3>
                  <p className="text-white/60 mb-6">
                    Thanks for reaching out. We&apos;ll get back to you as soon
                    as possible.
                  </p>
                  <Button
                    variant="outline"
                    className="bg-white/5 text-white border-white/20 hover:bg-white/10"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        category: "general",
                        message: "",
                      });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-lg font-semibold text-white mb-2">
                    Send us a message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-sm font-medium text-white/70 mb-2"
                      >
                        Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({...formData, name: e.target.value})
                        }
                        placeholder="Your name"
                        className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-sm font-medium text-white/70 mb-2"
                      >
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({...formData, email: e.target.value})
                        }
                        placeholder="you@example.com"
                        className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-category"
                      className="block text-sm font-medium text-white/70 mb-2"
                    >
                      Category
                    </label>
                    <select
                      id="contact-category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({...formData, category: e.target.value})
                      }
                      className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/50 transition-colors appearance-none"
                    >
                      <option value="general" className="bg-gray-900">
                        General Inquiry
                      </option>
                      <option value="bug" className="bg-gray-900">
                        Bug Report
                      </option>
                      <option value="feature" className="bg-gray-900">
                        Feature Request
                      </option>
                      <option value="game-submission" className="bg-gray-900">
                        Game Submission
                      </option>
                      <option value="partnership" className="bg-gray-900">
                        Partnership
                      </option>
                      <option value="other" className="bg-gray-900">
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-white/70 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({...formData, message: e.target.value})
                      }
                      placeholder="Tell us what's on your mind..."
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/50 transition-colors resize-none"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
