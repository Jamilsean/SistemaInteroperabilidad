import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendPasswordCode, verifyPasswordCode } from "@/services/authPasswordService";
import type { SendPasswordCodePayload,   VerifyPasswordCodePayload} from  "@/types/auth";
import { Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { parseAxiosError } from "@/lib/http-error";
 
const MIN_PASS_LEN = 8;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const prefillEmail = params.get("email") ?? "";

  const [step, setStep] = React.useState<"send" | "verify">("send");
  const [loading, setLoading] = React.useState(false);

  // Estados
  const [email, setEmail] = React.useState(prefillEmail);
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");

  //   helpers
  const [showPass, setShowPass] = React.useState(false);
  const [showPass2, setShowPass2] = React.useState(false);

  // Enviar 
  const [cooldown, setCooldown] = React.useState(0);
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  // --- Validación ---
  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const canSend = isValidEmail(email) && !loading;
  const canVerify =
    isValidEmail(email) &&
    code.trim().length > 0 &&
    password.length >= MIN_PASS_LEN &&
    password === password2 &&
    !loading;

  async function handleSend() {
    if (!isValidEmail(email)) {
      toast.error("Ingresa un correo válido.");
      return;
    }
    setLoading(true);
    try {
      const payload: SendPasswordCodePayload = { email: email.trim() };
      const res = await sendPasswordCode(payload);
      toast.success(res.message || "Código enviado.");
      setStep("verify");
      setCooldown(60);  
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo enviar el código.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!canVerify) return;
    setLoading(true);
    try {
      const payload: VerifyPasswordCodePayload = {
        email: email.trim(),
        code: code.trim(),
        password,
        password_confirmation: password2,
      };
      const res = await verifyPasswordCode(payload);
      toast.success(res.message || "Contraseña actualizada correctamente.");
      navigate("/login", { replace: true });
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{step === "send" ? "Recuperar contraseña" : "Verifica tu código"}</CardTitle>
          <CardDescription>
            {step === "send"
              ? "Ingresa tu correo y te enviaremos un código de verificación."
              : "Escribe el código que te enviamos y define tu nueva contraseña."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-8"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                autoComplete="email"
              />
            </div>
          </div>

          {step === "verify" && (
            <>
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="code"
                    className="pl-8 tracking-widest"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{cooldown > 0 ? `Puedes reenviar en ${cooldown}s` : "¿No te llegó?"}</span>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 h-auto"
                    disabled={cooldown > 0 || loading}
                    onClick={handleSend}
                  >
                    Reenviar código
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={MIN_PASS_LEN}
                    placeholder={`Mínimo ${MIN_PASS_LEN} caracteres`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2.5 text-muted-foreground"
                    onClick={() => setShowPass((s) => !s)}
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar */}
              <div className="space-y-2">
                <Label htmlFor="password2">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="password2"
                    type={showPass2 ? "text" : "password"}
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    minLength={MIN_PASS_LEN}
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2.5 text-muted-foreground"
                    onClick={() => setShowPass2((s) => !s)}
                    aria-label={showPass2 ? "Ocultar confirmación" : "Mostrar confirmación"}
                  >
                    {showPass2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && password2 && password !== password2 && (
                  <p className="text-xs text-red-600">Las contraseñas no coinciden.</p>
                )}
                {password && password.length < MIN_PASS_LEN && (
                  <p className="text-xs text-red-600">La contraseña debe tener al menos {MIN_PASS_LEN} caracteres.</p>
                )}
              </div>
            </>
          )}

          {/* Acciones */}
          {step === "send" ? (
            <Button className="w-full" onClick={handleSend} disabled={!canSend}>
              Enviar código
            </Button>
          ) : (
            <Button className="w-full" onClick={handleVerify} disabled={!canVerify}>
              Actualizar contraseña
            </Button>
          )}

          {/* Switch back to login */}
          <div className="text-center text-sm">
            <Button variant="link" className="px-0" onClick={() => navigate("/login")}>
              Volver al inicio de sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
