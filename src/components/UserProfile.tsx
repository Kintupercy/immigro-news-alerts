
import { User } from "@supabase/supabase-js";
import ProfileManagement from "./ProfileManagement";

interface UserProfileProps {
  user: User;
}

const UserProfile = ({ user }: UserProfileProps) => {
  return <ProfileManagement user={user} />;
};

export default UserProfile;
