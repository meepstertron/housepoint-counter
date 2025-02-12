import UsernameForm from "@/components/forms/username-form"
import EmailForm from "@/components/forms/email-form"
import PasswordForm from "@/components/forms/password-form"
import DeleteAccountForm from "@/components/forms/delete-account-form"
import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/api'
import useToken from '@/components/useToken';

interface UserData {
  username: string
  email: string
}

export default function SettingsPage() {
  const { token } = useToken();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        console.error("No token available");
        return;
      }
      try {
        const data = await getCurrentUser(token);
        setUserData({ username: data.name, email: data.email });
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, [token]);

  if (!userData) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Settings</h3>
        <p className="text-sm text-gray-500">
          Manage your account settings and set email preferences.
        </p>
      </div>
      <div className="border-t border-gray-200 pt-6">
        <UsernameForm initialUsername={userData.username} token={token} />
      </div>
      <div className="border-t border-gray-200 pt-6">
        <EmailForm initialEmail={userData.email} token={token} />
      </div>
      <div className="border-t border-gray-200 pt-6">
        <PasswordForm token={token} />
      </div>
      <div className="border-t border-gray-200 pt-6">
        <DeleteAccountForm token={token} />
      </div>
    </div>
  )
}

