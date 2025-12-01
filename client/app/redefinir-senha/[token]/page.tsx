"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { resetPassword } from "@/services/auth-api";
import { toast } from "sonner";
import { validatePassword } from "@/lib/password-validation";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token inválido ou ausente");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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

    if (!token) {
      setError("Token inválido");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      toast.success("Senha redefinida com sucesso!");
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha. O token pode ter expirado.");
      toast.error(err.message || "Erro ao redefinir senha");
      console.error("Erro ao redefinir senha:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="relative min-h-screen py-32 flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/backgroung.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-md w-full bg-gray-900/90 rounded-xl shadow-2xl p-8 backdrop-blur-md border border-gray-800/50 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600/20 p-4 rounded-full">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Token inválido</h2>
          <p className="text-gray-400 mb-6">
            O link de redefinição de senha é inválido ou expirou.
          </p>
          <Button
            onClick={() => router.push("/recuperar-senha")}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
          >
            Solicitar novo link
          </Button>
        </div>
      </div>
    );
  }

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
                  <Lock className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
                Redefinir Senha
              </h1>
              <p className="text-gray-400 mt-2">
                Digite sua nova senha abaixo
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
                  htmlFor="password"
                  className="text-sm font-medium text-gray-300"
                >
                  Nova Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    className="w-full bg-gray-800 border-gray-700 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Mínimo de 8 caracteres, 1 maiúscula e 1 número
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-300"
                >
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    required
                    className="w-full bg-gray-800 border-gray-700 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redefinindo...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Redefinir Senha
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-gray-400 hover:text-red-500"
              >
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
                Senha redefinida!
              </h2>
              <p className="text-gray-400">
                Sua senha foi alterada com sucesso. Você será redirecionado em instantes...
              </p>
            </div>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              Ir para o login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

