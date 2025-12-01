"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success("Login realizado com sucesso!");
      router.push("/");
    } catch (err: any) {
      const errorMessage = err.message || "Credenciais inválidas. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Erro ao fazer login:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen py-32 flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/backgroung.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay escuro com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
        {/* Efeito de blur sutil */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-md w-full bg-gray-900/90 rounded-xl shadow-2xl p-8 backdrop-blur-md border border-gray-800/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
            Entrar
          </h1>
          <p className="text-gray-400 mt-2">
            Faça login para acessar sua conta
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                Senha
              </label>
              <Link
                href="/recuperar-senha"
                className="text-xs text-red-500 hover:text-red-400"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              className="w-full bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-400">
            Não tem uma conta?{" "}
            <Link
              href="/cadastro"
              className="text-red-500 hover:text-red-400 font-medium"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
