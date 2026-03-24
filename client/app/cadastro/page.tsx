"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { validatePassword } from "@/lib/password-validation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWakingMsg, setShowWakingMsg] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowWakingMsg(false);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    // Validar senha forte
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(". "));
      return;
    }

    setIsSubmitting(true);
    
    // Timer para mostrar aviso de "Cold Start" após 4 segundos
    const wakingTimer = setTimeout(() => {
      setShowWakingMsg(true);
    }, 4000);

    try {
      await register(name, email, password);

      toast.success(
        "Conta criada com sucesso! Faça login para continuar."
      );

      // Redirecionar para login após 2 segundos (dar tempo para o toast aparecer)
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao criar conta. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Erro ao registrar:", err);
    } finally {
      clearTimeout(wakingTimer);
      setIsSubmitting(false);
      setShowWakingMsg(false);
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
      <div className="relative z-10 max-w-md w-full bg-neutral-950/40 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 md:p-10 backdrop-blur-3xl border border-white/10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-white tracking-tight mb-3">
            Criar Conta
          </h1>
          <p className="text-neutral-500 text-[15px]">
            Junte-se ao <span className="text-neutral-300 font-medium">Onde Tá Passando?</span>
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl text-[14px] leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-[13px] font-medium text-neutral-400 ml-1 uppercase tracking-wider">
              Nome completo
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João Silva"
              required
              className="w-full bg-white/5 border-white/5 h-12 rounded-xl text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-red-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-[13px] font-medium text-neutral-400 ml-1 uppercase tracking-wider"
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
              className="w-full bg-white/5 border-white/5 h-12 rounded-xl text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-red-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-[13px] font-medium text-neutral-400 ml-1 uppercase tracking-wider"
            >
              Senha
            </label>
            <div className="relative group/pass">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border-white/5 h-12 rounded-xl text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-red-500/50 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors p-1"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 ml-1">
              Mínimo de 8 caracteres, 1 maiúscula e 1 número
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-[13px] font-medium text-neutral-400 ml-1 uppercase tracking-wider"
            >
              Confirmar Senha
            </label>
            <div className="relative group/pass">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border-white/5 h-12 rounded-xl text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-red-500/50 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors p-1"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-14 rounded-2xl text-[16px] font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> 
                  <span>Criando conta...</span>
                </div>
              ) : (
                "Cadastrar"
              )}
            </Button>
            
            {showWakingMsg && (
              <p className="text-[10px] text-center text-red-400 animate-pulse font-medium uppercase tracking-widest pt-2">
                Aguardando servidor... (Cold Start pode levar 30s)
              </p>
            )}
          </div>
        </form>

        <div className="mt-10 text-center">
          <p className="text-neutral-500 text-[14px]">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-white hover:text-red-400 font-semibold underline underline-offset-4 transition-colors"
            >
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
