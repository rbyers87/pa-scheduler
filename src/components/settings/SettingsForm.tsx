import { useAuth } from "@/contexts/AuthContext";
import { UpdatePasswordForm } from "@/components/settings/UpdatePasswordForm";

export const SettingsForm = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Your email: {user?.email}
        </p>
      </div>
      <div className="border-t pt-6">
        <UpdatePasswordForm />
      </div>
    </div>
  );
};