
import { useAuth } from "@/contexts/AuthContext";
import ProfileManagement from "./profile/ProfileManagement";

const UserProfile = () => {
  const { user } = useAuth();
  
  if (!user) {
    return null; // This shouldn't happen due to ProtectedRoute, but good for type safety
  }
  
  return <ProfileManagement user={user} />;
};

export default UserProfile;
