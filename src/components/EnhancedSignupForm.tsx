
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validatePasswordStrength, validateEmail, checkRateLimit, sanitizeInput } from "@/utils/authSecurity";
import { Eye, EyeOff, AlertTriangle, Check, X } from "lucide-react";
import { Link } from "react-router-dom";

const EnhancedSignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordValidation, setPasswordValidation] = useState<{isValid: boolean; errors: string[]}>({
    isValid: false,
    errors: []
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Real-time password validation
    if (field === 'password') {
      setPasswordValidation(validatePasswordStrength(sanitizedValue));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate names
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || "Invalid email";
    }

    // Validate password
    if (!passwordValidation.isValid) {
      newErrors.password = "Password does not meet security requirements";
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check rate limiting
      const rateLimitCheck = await checkRateLimit(formData.email);
      if (!rateLimitCheck.allowed) {
        toast({
          title: "Too many attempts",
          description: "Please wait before trying again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
        
        // Clear form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: ""
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                disabled={loading}
                required
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                disabled={loading}
                required
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={loading}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={loading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Password strength indicator */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="text-xs font-medium">Password Requirements:</div>
                {passwordValidation.errors.map((error, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs">
                    <X className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">{error}</span>
                  </div>
                ))}
                {passwordValidation.isValid && (
                  <div className="flex items-center gap-1 text-xs">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Password meets all requirements</span>
                  </div>
                )}
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                disabled={loading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || !passwordValidation.isValid}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/auth" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </form>

        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Your data is protected with enterprise-grade security. We never share your information with third parties.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EnhancedSignupForm;
