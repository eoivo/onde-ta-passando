"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Mail, Heart, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-800/50 mt-auto py-12">
      <div className="max-w-[1600px] px-4 md:px-12 mx-auto">
        <div className="flex flex-col items-center text-center space-y-10">
          {/* Brand & Social Section */}
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex flex-col items-center gap-3">
                <Image
                  src="/images/logo.png"
                  alt="Onde Tá Passando? Logo"
                  width={40}
                  height={40}
                  className="rounded-lg shadow-2xl shadow-red-600/20"
                  onError={(e) => {
                    e.currentTarget.src = "/favicon.ico";
                  }}
                />
                <h3 className="text-2xl md:text-3xl font-normal font-bebas tracking-widest uppercase italic leading-none">
                  <span className="text-white">Onde Tá </span>
                  <span className="text-red-600">Passando?</span>
                </h3>
              </div>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light max-w-md">
                Encontre onde assistir seus filmes e séries favoritos em diversas
                plataformas de streaming.
              </p>
            </div>

            {/* Social Icons - Centered under text */}
            <div className="flex justify-center gap-4">
              {[
                { icon: <Github className="h-5 w-5" />, label: "GitHub" },
                { icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
                { icon: <Mail className="h-5 w-5" />, label: "Email" },
              ].map((social, i) => (
                <button
                  key={i}
                  className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-800 bg-gray-900/30 text-gray-400 hover:border-red-600/50 hover:text-white hover:bg-red-600/5 transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation - Centered Horizontal Line */}
          <nav className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 border-y border-gray-800/50 py-6 w-full max-w-4xl">
            {[
              { href: "/", label: "Início" },
              { href: "/filmes", label: "Filmes" },
              { href: "/series", label: "Séries" },
              { href: "/#collections", label: "Coleções" },
              { href: "/termos", label: "Termos" },
              { href: "/privacidade", label: "Privacidade" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <div className="pt-2">
            <p className="text-[11px] text-gray-600 font-bold tracking-[0.3em] uppercase">
              © {currentYear} Onde Tá Passando? • Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
