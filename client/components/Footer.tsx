"use client";

import Link from "next/link";
import Image from "next/image";
import CopyEmailButton from "./CopyEmailButton";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10 mt-auto py-12">
      <div className="max-w-[1600px] px-4 md:px-12 mx-auto">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Brand & Contact Section */}
          <div className="space-y-5 max-w-2xl">
            <div className="space-y-3 flex flex-col items-center">
              <div className="flex flex-col items-center gap-3">
                <Image
                  src="/images/logos/icon.png"
                  alt="Onde Tá Passando? Logo"
                  width={40}
                  height={40}
                  className="rounded-lg shadow-2xl shadow-red-600/20"
                  onError={(e) => {
                    e.currentTarget.src = "/favicon.ico";
                  }}
                />
                <h3 className="text-2xl md:text-3xl font-normal font-bebas tracking-wider uppercase leading-none">
                  <span className="text-white">Onde Tá </span>
                  <span className="text-red-600">Passando?</span>
                </h3>
              </div>
              <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-md">
                Encontre onde assistir seus filmes e séries favoritos em diversas
                plataformas de streaming.
              </p>
            </div>

            {/* Canal de Contato Oficial */}
            <div className="flex justify-center">
              <CopyEmailButton />
            </div>
          </div>

          {/* Navigation - Centered Horizontal Line */}
          <nav className="flex flex-wrap justify-center items-center gap-x-8 md:gap-x-10 gap-y-3 border-y border-white/10 py-5 w-full max-w-4xl">
            {[
              { href: "/", label: "Início" },
              { href: "/filmes", label: "Filmes" },
              { href: "/series", label: "Séries" },
              { href: "/sintonia", label: "Sintonia" },
              { href: "/termos", label: "Termos" },
              { href: "/privacidade", label: "Privacidade" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-bold text-neutral-400 hover:text-white transition-colors duration-200 uppercase tracking-[0.18em] relative group py-1"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <div className="pt-1">
            <p className="text-[11px] text-neutral-500 font-semibold tracking-[0.22em] uppercase">
              © {currentYear} Onde Tá Passando? • Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
