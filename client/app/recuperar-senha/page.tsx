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
      <div className="relative z-10 max-w-md w-full bg-gray-900/90 rounded-xl shadow-2xl p-8 backdrop-blur-md border border-gray-800/50">
        {!isSuccess ? (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-red-600/20 p-3 rounded-full">
                  <Mail className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
                Esqueci minha senha
              </h1>
              <p className="text-gray-400 mt-2">
                Digite seu email e enviaremos um link para redefinir sua senha
              </p>
            </div>

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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar link de redefinição
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-gray-400 hover:text-red-500 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-600/20 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Email enviado!
              </h2>
              <p className="text-gray-400">
                Enviamos um link de redefinição de senha para{" "}
                <strong className="text-white">{email}</strong>
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-300 mb-2">
                <strong>Próximos passos:</strong>
              </p>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>Verifique sua caixa de entrada</li>
                <li>Clique no link do email (válido por 10 minutos)</li>
                <li>Crie uma nova senha</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                Voltar para o login
              </Button>
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Enviar outro email
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

