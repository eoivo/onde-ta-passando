"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPassword } from "@/services/auth-api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
      toast.success("Email de redefinição enviado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar email. Tente novamente.");
      console.error("Erro ao solicitar reset:", err);
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
      <div className="relative z-10 max-w-md w-full bg-neutral-950/40 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 md:p-10 backdrop-blur-3xl border border-white/10">
        {!isSuccess ? (
          <>
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="bg-red-500/10 p-4 rounded-2xl">
                  <Mail className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h1 className="text-3xl font-semibold text-white tracking-tight mb-3">
                Esqueci minha senha
              </h1>
              <p className="text-neutral-500 text-[15px]">
                Digite seu email e enviaremos um link para redefinir sua senha
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-neutral-100 hover:text-black text-white h-14 rounded-2xl text-[16px] font-semibold transition-all duration-300 shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> 
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar link
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="text-sm text-neutral-400 hover:text-red-400 flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="bg-green-500/10 p-5 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Email enviado!
              </h2>
              <p className="text-neutral-500 text-[15px]">
                Enviamos um link de redefinição para <br/>
                <strong className="text-white font-medium">{email}</strong>
              </p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-left">
              <p className="text-sm text-neutral-300 font-semibold mb-3 uppercase tracking-wider text-[11px]">
                Próximos passos
              </p>
              <ul className="text-sm text-neutral-400 space-y-2 text-[13px]">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  Verifique sua caixa de entrada
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  Clique no link para criar nova senha
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-red-600 hover:bg-neutral-100 hover:text-black text-white h-14 rounded-2xl text-[16px] font-semibold transition-all duration-300 shadow-xl"
              >
                Voltar para o login
              </Button>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                className="text-sm text-neutral-500 hover:text-white transition-colors underline underline-offset-4"
              >
                Enviar outro email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

