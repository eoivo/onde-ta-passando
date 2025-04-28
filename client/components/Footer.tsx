"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Mail, Heart, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-800 mt-auto py-8">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Onde Tá Passando? Logo"
                width={32}
                height={32}
                className="rounded-sm"
                onError={(e) => {
                  // Fallback para favicon se o logo não for encontrado
                  e.currentTarget.src = "/favicon.ico";
                }}
              />
              <h3 className="text-lg font-medium text-white">
                Onde Tá Passando?
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              Encontre onde assistir seus filmes e séries favoritos em diversas
              plataformas de streaming.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/filmes"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Filmes
                </Link>
              </li>
              <li>
                <Link
                  href="/series"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Séries
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/termos"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Contato</h3>
            <div className="flex space-x-4">
              <button
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </button>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </button>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {currentYear} Onde Tá Passando? Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-400 flex items-center mt-4 md:mt-0">
            Feito com <Heart className="h-4 w-4 mx-1 text-red-500" /> no Brasil
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
