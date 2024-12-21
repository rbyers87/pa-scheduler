/**
 * Settings Page
 * 
 * Manages application settings and configurations.
 * Features:
 * - User preferences
 * - District configurations
 * - System settings
 * - Access control settings
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SettingsForm } from "@/components/settings/SettingsForm";

const Settings = () => {
  const { session, accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
