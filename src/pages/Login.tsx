import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LoginForm } from "@/components/auth/LoginForm";
import { ResetPasswordDialog } from "@/components/auth/ResetPasswordDialog";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Workforce Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4">
            <ResetPasswordDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;