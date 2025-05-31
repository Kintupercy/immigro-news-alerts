
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@supabase/supabase-js";

interface PersonalInfoSectionProps {
  profile: {
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
  };
  user: User;
  isProMember: boolean;
  saving: boolean;
  onUpdate: (updates: any) => void;
}

const PersonalInfoSection = ({ 
  profile, 
  user, 
  isProMember, 
  saving, 
  onUpdate 
}: PersonalInfoSectionProps) => {
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) return '';
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    const cleanPhone = formatted.replace(/\D/g, '');
    onUpdate({ phone_number: cleanPhone || null });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profile.first_name || ''}
              onChange={(e) => onUpdate({ first_name: e.target.value })}
              disabled={saving}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profile.last_name || ''}
              onChange={(e) => onUpdate({ last_name: e.target.value })}
              disabled={saving}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number {isProMember && <span className="text-emerald-600">(Pro)</span>}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={formatPhoneNumber(profile.phone_number || '')}
            onChange={handlePhoneChange}
            disabled={saving || !isProMember}
            className={!isProMember ? "bg-gray-100" : ""}
          />
          {!isProMember && (
            <p className="text-sm text-muted-foreground mt-1">
              Phone number is required for SMS notifications (Pro feature)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoSection;
