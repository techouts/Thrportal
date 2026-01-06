import { useState, useCallback, useEffect } from "react";
import AvatarUploadDialog from "@/components/profile/AvatarUploadDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Phone,
  Mail,
  MapPin,
  Building,
  Camera,
  Edit3,
  Save,
  X,
  Plus,
  ExternalLink,
  Users,
  Crown,
  Loader2,
  CalendarIcon,
  Trash2,
  User,
  Heart,
  Baby,
  FileText,
} from "lucide-react";
import ProfileDocumentsTab from "@/components/profile/documents/ProfileDocumentsTab";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  VALIDATION_RULES,
  BLOOD_GROUP_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NATIONALITY_OPTIONS,
} from "@/types/profile";
import type {
  EmployeeProfile,
  ProfileUpdateData,
  FamilyMember,
} from "@/types/profile";
import { useAuth } from "@/auth/AuthContext";
import {
  getCurrentProfile,
  getProfileById,
  updateProfile,
  fetchProfileMe,
} from "@/services/profileService";

interface ProfileProps {
  isOwnProfile?: boolean;
  employeeId?: string;
}

export default function Profile({
  isOwnProfile = true,
  employeeId,
}: ProfileProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ProfileUpdateData>>({});
  const [newInterest, setNewInterest] = useState("");
  const [saving, setSaving] = useState(false);
  const [sameAsTemporary, setSameAsTemporary] = useState(false);
  const [newChild, setNewChild] = useState<Partial<FamilyMember>>({
    name: "",
    date_of_birth: "",
    gender: "Male",
  });
  const userId = localStorage.getItem("auth_user_id");
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const NODE_API_BASE_URL = import.meta.env.VITE_API_BASE_NODE_URL;

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const profileData = userId
          ? await fetchProfileMe(userId)
          : await getCurrentProfile(userId);

        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId, toast]);

  const handleEdit = useCallback(
    (section: string) => {
      if (!profile) return;
      setEditingSection(section);
      if (section === "contacts") {
        setEditData({
          phone: profile.phone || "",
          city: profile.city || "",
          country: profile.country || "",
          personal_email: profile.personal_email || "",
          temporary_address: profile.temporary_address || "",
          permanent_address: profile.permanent_address || "",
          alternate_phone: profile.alternate_phone || "",
        });
      } else if (section === "about") {
        setEditData({
          about: profile.about || "",
          interests: [...(profile.interests || [])],
        });
      } else if (section === "personal") {
        setEditData({
          date_of_birth: profile.date_of_birth || "",
          blood_group: profile.blood_group || "",
          family_details: [...(profile.family_details || [])],
          gender: profile.gender || "",
          marital_status: profile.marital_status || "",
          is_physically_handicapped: profile.is_physically_handicapped || false,
          nationality: profile.nationality || "",
        });
      }
    },
    [profile]
  );

  const handleSave = useCallback(
    async (section: string) => {
      if (!user?.id || !profile) return;

      try {
        // Validation
        if (section === "contacts") {
          if (
            editData.phone &&
            !VALIDATION_RULES.phone.pattern.test(editData.phone)
          ) {
            toast({
              title: "Validation Error",
              description: VALIDATION_RULES.phone.message,
              variant: "destructive",
            });
            return;
          }
          if (
            editData.city &&
            editData.city.length > VALIDATION_RULES.city.maxLength
          ) {
            toast({
              title: "Validation Error",
              description: VALIDATION_RULES.city.message,
              variant: "destructive",
            });
            return;
          }
          if (
            editData.country &&
            editData.country.length > VALIDATION_RULES.country.maxLength
          ) {
            toast({
              title: "Validation Error",
              description: VALIDATION_RULES.country.message,
              variant: "destructive",
            });
            return;
          }
        }

        if (section === "about") {
          if (
            editData.about &&
            editData.about.length > VALIDATION_RULES.about.maxLength
          ) {
            toast({
              title: "Validation Error",
              description: VALIDATION_RULES.about.message,
              variant: "destructive",
            });
            return;
          }
        }

        setSaving(true);
        const success = await updateProfile(
          user.id,
          editData as ProfileUpdateData
        );

        if (success) {
          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  ...editData,
                  updated_at: new Date().toISOString(),
                }
              : null
          );

          setEditingSection(null);
          setEditData({});

          toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
          });
        } else {
          throw new Error("Update failed");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    },
    [editData, toast, user?.id, profile]
  );

  const handleCancel = useCallback(() => {
    setEditingSection(null);
    setEditData({});
    setNewInterest("");
    setSameAsTemporary(false);
    setNewChild({ name: "", date_of_birth: "", gender: "Male" });
  }, []);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleAddChild = useCallback(() => {
    if (!newChild.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Child name is required",
        variant: "destructive",
      });
      return;
    }

    const child: FamilyMember = {
      id: crypto.randomUUID(),
      relationship: "Child",
      name: newChild.name.trim(),
      date_of_birth: newChild.date_of_birth,
      gender: newChild.gender,
    };

    setEditData((prev) => ({
      ...prev,
      family_details: [...(prev.family_details || []), child],
    }));
    setNewChild({ name: "", date_of_birth: "", gender: "Male" });
  }, [newChild, toast]);

  const handleRemoveFamilyMember = useCallback((id: string) => {
    setEditData((prev) => ({
      ...prev,
      family_details: (prev.family_details || []).filter((m) => m.id !== id),
    }));
  }, []);

  const updateFamilyMember = useCallback(
    (id: string, field: keyof FamilyMember, value: any) => {
      setEditData((prev) => ({
        ...prev,
        family_details: (prev.family_details || []).map((m) =>
          m.id === id ? { ...m, [field]: value } : m
        ),
      }));
    },
    []
  );

  // Validation helpers for family details
  const handleLettersOnly = (value: string) =>
    value.replace(/[^A-Za-z\s]/g, "");
  const handlePhoneOnly = (value: string) =>
    value.replace(/[^0-9]/g, "").slice(0, 10);

  const handleAddInterest = useCallback(() => {
    if (!newInterest.trim()) return;

    if (newInterest.length > VALIDATION_RULES.interest.maxLength) {
      toast({
        title: "Validation Error",
        description: VALIDATION_RULES.interest.message,
        variant: "destructive",
      });
      return;
    }

    const currentInterests = editData.interests || profile?.interests || [];
    if (currentInterests.includes(newInterest.trim())) {
      toast({
        title: "Duplicate Interest",
        description: "This interest is already added.",
        variant: "destructive",
      });
      return;
    }

    setEditData((prev) => ({
      ...prev,
      interests: [...currentInterests, newInterest.trim()],
    }));
    setNewInterest("");
  }, [newInterest, editData.interests, profile?.interests, toast]);

  const handleRemoveInterest = useCallback(
    (interest: string) => {
      setEditData((prev) => ({
        ...prev,
        interests: (prev.interests || profile?.interests || []).filter(
          (i) => i !== interest
        ),
      }));
    },
    [profile?.interests]
  );

  const getDisplayName = (firstName: string, lastName: string) =>
    `${firstName} ${lastName}`.trim() || "Unknown";
  const getInitials = (firstName: string, lastName: string) => {
    const f = firstName?.[0] || "";
    const l = lastName?.[0] || "";
    return (f + l).toUpperCase() || "?";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const tabOptions = [
    { value: "overview", label: "Overview" },
    { value: "personal", label: "Personal Details" },
    { value: "employment", label: "Employment" },
    { value: "contacts", label: "Contacts" },
    { value: "about", label: "About & Hobbies" },
    { value: "team", label: "Team" },
    { value: "documents", label: "Documents" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        {/* Mobile: Dropdown navigation */}
        {isMobile ? (
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {tabOptions.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.value === "documents" && (
                    <FileText className="h-4 w-4 mr-2 inline" />
                  )}
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          /* Desktop: Tabs navigation */
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personal">Personal Details</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="about">About & Hobbies</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-1" />
              Documents
            </TabsTrigger>
          </TabsList>
        )}

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={`${NODE_API_BASE_URL}${profile.avatar_url}`}
                        alt={getDisplayName(
                          profile.first_name,
                          profile.last_name
                        )}
                      />
                      <AvatarFallback className="text-xl">
                        {getInitials(profile.first_name, profile.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        onClick={() => setShowAvatarUpload(true)}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                      {getDisplayName(profile.first_name, profile.last_name)}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {profile.role_title}
                    </p>
                    <div className="flex items-center gap-2">
                      {profile.department?.name && (
                        <Badge variant="secondary">
                          {profile.department.name}
                        </Badge>
                      )}
                      {(profile.city || profile.country) && (
                        <Badge variant="outline">
                          {[profile.city, profile.country]
                            .filter(Boolean)
                            .join(", ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-sm hover:underline"
                  >
                    {profile.email}
                  </a>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${profile.phone}`}
                      className="text-sm hover:underline"
                    >
                      {profile.phone}
                    </a>
                  </div>
                )}
                {profile.business_unit?.name && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {profile.business_unit.name}
                    </span>
                  </div>
                )}
                {profile.cost_center?.code && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.cost_center.code}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Details Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Details</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </div>
                {isOwnProfile && editingSection !== "personal" && (
                  <Button onClick={() => handleEdit("personal")}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 overflow-hidden">
              {editingSection === "personal" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !editData.date_of_birth && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editData.date_of_birth ? (
                              format(new Date(editData.date_of_birth), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 max-w-[calc(100vw-2rem)]"
                          align="center"
                          side="bottom"
                          sideOffset={4}
                        >
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            fromYear={1950}
                            toYear={new Date().getFullYear()}
                            selected={
                              editData.date_of_birth
                                ? new Date(editData.date_of_birth)
                                : undefined
                            }
                            onSelect={(date) =>
                              setEditData((prev) => ({
                                ...prev,
                                date_of_birth: date
                                  ? format(date, "yyyy-MM-dd")
                                  : undefined,
                              }))
                            }
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Group</Label>
                      <Select
                        value={editData.blood_group || ""}
                        onValueChange={(value) =>
                          setEditData((prev) => ({
                            ...prev,
                            blood_group: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUP_OPTIONS.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={editData.gender || ""}
                        onValueChange={(value) =>
                          setEditData((prev) => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {gender}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Marital Status</Label>
                      <Select
                        value={editData.marital_status || ""}
                        onValueChange={(value) =>
                          setEditData((prev) => ({
                            ...prev,
                            marital_status: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                        <SelectContent>
                          {MARITAL_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nationality</Label>
                      <Select
                        value={editData.nationality || ""}
                        onValueChange={(value) =>
                          setEditData((prev) => ({
                            ...prev,
                            nationality: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          {NATIONALITY_OPTIONS.map((nat) => (
                            <SelectItem key={nat} value={nat}>
                              {nat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id="is_physically_handicapped"
                          checked={editData.is_physically_handicapped || false}
                          onCheckedChange={(checked) =>
                            setEditData((prev) => ({
                              ...prev,
                              is_physically_handicapped: checked === true,
                            }))
                          }
                        />
                        <Label
                          htmlFor="is_physically_handicapped"
                          className="cursor-pointer"
                        >
                          Physically Handicapped
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      Family Details
                    </Label>

                    {/* Father and Mother - always shown */}
                    {["Father", "Mother"].map((rel) => {
                      const member = (editData.family_details || []).find(
                        (m) => m.relationship === rel
                      );
                      return (
                        <Card key={rel} className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="h-4 w-4" />
                            <Label className="font-medium">{rel}</Label>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input
                              placeholder="Name"
                              value={member?.name || ""}
                              onChange={(e) => {
                                const validatedValue = handleLettersOnly(
                                  e.target.value
                                );
                                if (member) {
                                  updateFamilyMember(
                                    member.id,
                                    "name",
                                    validatedValue
                                  );
                                } else {
                                  setEditData((prev) => ({
                                    ...prev,
                                    family_details: [
                                      ...(prev.family_details || []),
                                      {
                                        id: crypto.randomUUID(),
                                        relationship: rel as any,
                                        name: validatedValue,
                                      },
                                    ],
                                  }));
                                }
                              }}
                            />
                            <Input
                              placeholder="Phone"
                              value={member?.phone || ""}
                              onChange={(e) =>
                                member &&
                                updateFamilyMember(
                                  member.id,
                                  "phone",
                                  handlePhoneOnly(e.target.value)
                                )
                              }
                            />
                            <Input
                              placeholder="Occupation"
                              value={member?.occupation || ""}
                              onChange={(e) =>
                                member &&
                                updateFamilyMember(
                                  member.id,
                                  "occupation",
                                  handleLettersOnly(e.target.value)
                                )
                              }
                            />
                          </div>
                        </Card>
                      );
                    })}

                    {/* Spouse/Husband - only shown if marital status is Married */}
                    {(editData.marital_status === "Married" ||
                      profile?.marital_status === "Married") &&
                      (() => {
                        const spouseLabel =
                          editData.gender === "Female" ||
                          profile?.gender === "Female"
                            ? "Husband"
                            : "Spouse";
                        const member = (editData.family_details || []).find(
                          (m) => m.relationship === "Spouse"
                        );
                        return (
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Heart className="h-4 w-4" />
                              <Label className="font-medium">
                                {spouseLabel}
                              </Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <Input
                                placeholder="Name"
                                value={member?.name || ""}
                                onChange={(e) => {
                                  const validatedValue = handleLettersOnly(
                                    e.target.value
                                  );
                                  if (member) {
                                    updateFamilyMember(
                                      member.id,
                                      "name",
                                      validatedValue
                                    );
                                  } else {
                                    setEditData((prev) => ({
                                      ...prev,
                                      family_details: [
                                        ...(prev.family_details || []),
                                        {
                                          id: crypto.randomUUID(),
                                          relationship: "Spouse" as any,
                                          name: validatedValue,
                                        },
                                      ],
                                    }));
                                  }
                                }}
                              />
                              <Input
                                placeholder="Phone"
                                value={member?.phone || ""}
                                onChange={(e) =>
                                  member &&
                                  updateFamilyMember(
                                    member.id,
                                    "phone",
                                    handlePhoneOnly(e.target.value)
                                  )
                                }
                              />
                              <Input
                                placeholder="Occupation"
                                value={member?.occupation || ""}
                                onChange={(e) =>
                                  member &&
                                  updateFamilyMember(
                                    member.id,
                                    "occupation",
                                    handleLettersOnly(e.target.value)
                                  )
                                }
                              />
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !member?.date_of_birth &&
                                        "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {member?.date_of_birth
                                      ? format(
                                          new Date(member.date_of_birth),
                                          "dd MMM yyyy"
                                        )
                                      : "Date of Birth"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    captionLayout="dropdown"
                                    fromYear={1950}
                                    toYear={new Date().getFullYear()}
                                    selected={
                                      member?.date_of_birth
                                        ? new Date(member.date_of_birth)
                                        : undefined
                                    }
                                    onSelect={(date) => {
                                      if (date) {
                                        if (member) {
                                          updateFamilyMember(
                                            member.id,
                                            "date_of_birth",
                                            format(date, "yyyy-MM-dd")
                                          );
                                        } else {
                                          setEditData((prev) => ({
                                            ...prev,
                                            family_details: [
                                              ...(prev.family_details || []),
                                              {
                                                id: crypto.randomUUID(),
                                                relationship: "Spouse" as any,
                                                name: "",
                                                date_of_birth: format(
                                                  date,
                                                  "yyyy-MM-dd"
                                                ),
                                              },
                                            ],
                                          }));
                                        }
                                      }
                                    }}
                                    disabled={(date) =>
                                      date > new Date() ||
                                      date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </Card>
                        );
                      })()}

                    {/* Children - only shown if marital status is Married */}
                    {(editData.marital_status === "Married" ||
                      profile?.marital_status === "Married") && (
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Baby className="h-4 w-4" />
                          <Label className="font-medium">Children</Label>
                        </div>
                        {(editData.family_details || [])
                          .filter((m) => m.relationship === "Child")
                          .map((child) => (
                            <div
                              key={child.id}
                              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2 p-2 border rounded"
                            >
                              <Input
                                placeholder="Name"
                                value={child.name}
                                onChange={(e) =>
                                  updateFamilyMember(
                                    child.id,
                                    "name",
                                    handleLettersOnly(e.target.value)
                                  )
                                }
                                className="flex-1"
                              />
                              <div className="flex gap-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "flex-1 sm:w-40 justify-start text-left font-normal",
                                        !child.date_of_birth &&
                                          "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {child.date_of_birth
                                        ? format(
                                            new Date(child.date_of_birth),
                                            "dd MMM yyyy"
                                          )
                                        : "DOB"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      captionLayout="dropdown"
                                      fromYear={1990}
                                      toYear={new Date().getFullYear()}
                                      selected={
                                        child.date_of_birth
                                          ? new Date(child.date_of_birth)
                                          : undefined
                                      }
                                      onSelect={(date) =>
                                        updateFamilyMember(
                                          child.id,
                                          "date_of_birth",
                                          date
                                            ? format(date, "yyyy-MM-dd")
                                            : undefined
                                        )
                                      }
                                      disabled={(date) =>
                                        date > new Date() ||
                                        date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                      className="pointer-events-auto"
                                    />
                                  </PopoverContent>
                                </Popover>
                                <Select
                                  value={child.gender || "Male"}
                                  onValueChange={(value) =>
                                    updateFamilyMember(
                                      child.id,
                                      "gender",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-24 sm:w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">
                                      Female
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveFamilyMember(child.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
                          <Input
                            placeholder="Child name"
                            value={newChild.name || ""}
                            onChange={(e) =>
                              setNewChild((prev) => ({
                                ...prev,
                                name: handleLettersOnly(e.target.value),
                              }))
                            }
                            className="flex-1"
                          />
                          <div className="flex gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "flex-1 sm:w-40 justify-start text-left font-normal",
                                    !newChild.date_of_birth &&
                                      "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {newChild.date_of_birth
                                    ? format(
                                        new Date(newChild.date_of_birth),
                                        "dd MMM yyyy"
                                      )
                                    : "DOB"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  captionLayout="dropdown"
                                  fromYear={1990}
                                  toYear={new Date().getFullYear()}
                                  selected={
                                    newChild.date_of_birth
                                      ? new Date(newChild.date_of_birth)
                                      : undefined
                                  }
                                  onSelect={(date) =>
                                    setNewChild((prev) => ({
                                      ...prev,
                                      date_of_birth: date
                                        ? format(date, "yyyy-MM-dd")
                                        : undefined,
                                    }))
                                  }
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <Select
                              value={newChild.gender || "Male"}
                              onValueChange={(value) =>
                                setNewChild((prev) => ({
                                  ...prev,
                                  gender: value as any,
                                }))
                              }
                            >
                              <SelectTrigger className="w-24 sm:w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleAddChild}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave("personal")}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </Label>
                      <p>
                        {profile.date_of_birth
                          ? `${format(
                              new Date(profile.date_of_birth),
                              "dd MMM yyyy"
                            )} (${calculateAge(profile.date_of_birth)} years)`
                          : "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Blood Group
                      </Label>
                      <p>{profile.blood_group || "Not provided"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Gender
                      </Label>
                      <p>{profile.gender || "Not provided"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Marital Status
                      </Label>
                      <p>{profile.marital_status || "Not provided"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Nationality
                      </Label>
                      <p>{profile.nationality || "Not provided"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Physically Handicapped
                      </Label>
                      <p>{profile.is_physically_handicapped ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      Family Details
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["Father", "Mother"].map((rel) => {
                        const member = (profile.family_details || []).find(
                          (m) => m.relationship === rel
                        );
                        return (
                          <Card key={rel} className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4" />
                              <Label className="font-medium">{rel}</Label>
                            </div>
                            {member ? (
                              <div className="space-y-1 text-sm">
                                <p className="font-medium">{member.name}</p>
                                {member.phone && (
                                  <p className="text-muted-foreground">
                                    📞 {member.phone}
                                  </p>
                                )}
                                {member.occupation && (
                                  <p className="text-muted-foreground">
                                    💼 {member.occupation}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Not provided
                              </p>
                            )}
                          </Card>
                        );
                      })}
                    </div>

                    {/* Spouse/Husband - only shown if marital status is Married */}
                    {profile.marital_status === "Married" &&
                      (() => {
                        const spouseLabel =
                          profile.gender === "Female" ? "Husband" : "Spouse";
                        const spouse = (profile.family_details || []).find(
                          (m) => m.relationship === "Spouse"
                        );
                        return spouse ? (
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="h-4 w-4" />
                              <Label className="font-medium">
                                {spouseLabel}
                              </Label>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="font-medium">
                                {spouse.name}{" "}
                                {spouse.gender && `(${spouse.gender})`}
                              </p>
                              {spouse.phone && (
                                <p className="text-muted-foreground">
                                  📞 {spouse.phone}
                                </p>
                              )}
                              {spouse.occupation && (
                                <p className="text-muted-foreground">
                                  💼 {spouse.occupation}
                                </p>
                              )}
                              {spouse.date_of_birth && (
                                <p className="text-muted-foreground">
                                  🎂{" "}
                                  {format(
                                    new Date(spouse.date_of_birth),
                                    "dd MMM yyyy"
                                  )}
                                </p>
                              )}
                            </div>
                          </Card>
                        ) : (
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="h-4 w-4" />
                              <Label className="font-medium">
                                {spouseLabel}
                              </Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Not provided
                            </p>
                          </Card>
                        );
                      })()}

                    {/* Children - only shown if marital status is Married */}
                    {profile.marital_status === "Married" &&
                      (() => {
                        const children = (profile.family_details || []).filter(
                          (m) => m.relationship === "Child"
                        );
                        return (
                          <div>
                            <Label className="flex items-center gap-2 mb-3">
                              <Baby className="h-4 w-4" />
                              Children{" "}
                              {children.length > 0 && `(${children.length})`}
                            </Label>
                            {children.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {children.map((child) => (
                                  <Card key={child.id} className="p-3">
                                    <p className="font-medium text-sm">
                                      {child.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {child.gender}{" "}
                                      {child.date_of_birth &&
                                        `• ${calculateAge(
                                          child.date_of_birth
                                        )} years`}
                                    </p>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No children added
                              </p>
                            )}
                          </div>
                        );
                      })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Tab */}
        <TabsContent value="employment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
              <CardDescription>
                Official employment information (Read-only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Employee ID
                  </Label>
                  <p className="font-mono">
                    {profile.employee_code || "Not assigned"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Role
                  </Label>
                  <p>{profile.role_title || "Not assigned"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Date of Joining
                  </Label>
                  <p>
                    {profile.date_of_joining
                      ? new Date(profile.date_of_joining).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )
                      : "Not assigned"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Department
                  </Label>
                  <p>{profile.department?.name || "Not assigned"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Employee Type
                  </Label>
                  <p>{profile.employee_type || "Not assigned"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Shifts
                  </Label>
                  <p>{profile.shifts || "Not assigned"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Week Off
                  </Label>
                  <p>{profile.week_off || "Not assigned"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Leaves Policy
                  </Label>
                  <p>{profile.leaves_policy || "Not assigned"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Attendance Policy
                  </Label>
                  <p>{profile.attendance_policy || "Not assigned"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Cost Center
                  </Label>
                  <p>
                    {profile.cost_center?.code ||
                      profile.cost_center?.name ||
                      "Not assigned"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Location
                  </Label>
                  <p>{profile.work_location || "Not assigned"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Notice Period
                  </Label>
                  <p>{profile.notice_period || "Not assigned"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Band
                  </Label>
                  <p>{profile.band || "Not assigned"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Business Unit
                  </Label>
                  <p>{profile.business_unit?.name || "Not assigned"}</p>
                </div>
              </div>

              {/* Reporting Manager - separate section */}
              {profile.manager && (
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Reporting Manager
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.manager.photo_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(
                          profile.manager.first_name,
                          profile.manager.last_name
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {getDisplayName(
                          profile.manager.first_name,
                          profile.manager.last_name
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile.manager.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Your contact details</CardDescription>
                </div>
                {isOwnProfile && editingSection !== "contacts" && (
                  <Button onClick={() => handleEdit("contacts")}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingSection === "contacts" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Read-only)</Label>
                    <Input id="email" value={profile.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editData.phone || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          phone: handlePhoneOnly(e.target.value),
                        }))
                      }
                      placeholder="1234567890"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personal_email">Personal Email</Label>
                    <Input
                      id="personal_email"
                      type="email"
                      value={editData.personal_email || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          personal_email: e.target.value,
                        }))
                      }
                      placeholder="personal@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternate_phone">
                      Alternate Mobile Number
                    </Label>
                    <Input
                      id="alternate_phone"
                      value={editData.alternate_phone || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          alternate_phone: handlePhoneOnly(e.target.value),
                        }))
                      }
                      placeholder="1234567890"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editData.city || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          city: handleLettersOnly(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={editData.country || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          country: handleLettersOnly(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temporary_address">Temporary Address</Label>
                    <Textarea
                      id="temporary_address"
                      value={editData.temporary_address || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          temporary_address: e.target.value,
                        }))
                      }
                      placeholder="Enter temporary address"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permanent_address">Permanent Address</Label>
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="same-address"
                        checked={sameAsTemporary}
                        onCheckedChange={(checked) => {
                          setSameAsTemporary(checked as boolean);
                          if (checked) {
                            setEditData((prev) => ({
                              ...prev,
                              permanent_address: prev.temporary_address || "",
                            }));
                          }
                        }}
                      />
                      <label
                        htmlFor="same-address"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Same as Temporary Address
                      </label>
                    </div>
                    <Textarea
                      id="permanent_address"
                      value={editData.permanent_address || ""}
                      onChange={(e) => {
                        setEditData((prev) => ({
                          ...prev,
                          permanent_address: e.target.value,
                        }));
                        setSameAsTemporary(false);
                      }}
                      placeholder="Enter permanent address"
                      rows={2}
                      disabled={sameAsTemporary}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave("contacts")}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Email
                    </Label>
                    <p>{profile.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </Label>
                    <p>{profile.phone || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Personal Email
                    </Label>
                    <p>{profile.personal_email || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Alternate Mobile Number
                    </Label>
                    <p>{profile.alternate_phone || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      City
                    </Label>
                    <p>{profile.city || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Country
                    </Label>
                    <p>{profile.country || "Not provided"}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Temporary Address
                    </Label>
                    <p>{profile.temporary_address || "Not provided"}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Permanent Address
                    </Label>
                    <p>{profile.permanent_address || "Not provided"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* About & Hobbies Tab */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>About & Hobbies</CardTitle>
                  <CardDescription>
                    Tell us about yourself and your interests
                  </CardDescription>
                </div>
                {isOwnProfile && editingSection !== "about" && (
                  <Button onClick={() => handleEdit("about")}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {editingSection === "about" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="about">About</Label>
                    <Textarea
                      id="about"
                      value={editData.about || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          about: e.target.value,
                        }))
                      }
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={VALIDATION_RULES.about.maxLength}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {(editData.about || "").length}/
                      {VALIDATION_RULES.about.maxLength}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Interests</Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
                      {(editData.interests || []).map((interest, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1"
                        >
                          {interest}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                            onClick={() => handleRemoveInterest(interest)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add an interest..."
                        maxLength={VALIDATION_RULES.interest.maxLength}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddInterest())
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddInterest}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave("about")}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      About
                    </Label>
                    <p className="text-sm">
                      {profile.about || "No information provided yet."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Interests
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests && profile.interests.length > 0 ? (
                        profile.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary">
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No interests added yet.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Reporting Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.manager ? (
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.manager.photo_url} />
                    <AvatarFallback>
                      {getInitials(
                        profile.manager.first_name,
                        profile.manager.last_name
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {getDisplayName(
                        profile.manager.first_name,
                        profile.manager.last_name
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile.manager.role_title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile.manager.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No reporting manager</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Direct Reports ({profile.reports?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.reports && profile.reports.length > 0 ? (
                <div className="space-y-3">
                  {profile.reports.map((report) => (
                    <div key={report.id} className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={report.photo_url} />
                        <AvatarFallback>
                          {getInitials(report.first_name, report.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {getDisplayName(report.first_name, report.last_name)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {report.role_title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No direct reports</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <ProfileDocumentsTab
            isOwnProfile={isOwnProfile}
            employeeId={employeeId}
          />
        </TabsContent>
      </Tabs>

      {/* Avatar Upload Dialog */}
      {user && (
        <AvatarUploadDialog
          open={showAvatarUpload}
          onOpenChange={setShowAvatarUpload}
          currentAvatarUrl={profile?.avatar_url}
          userId={user.id}
          userName={
            profile
              ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
              : "User"
          }
          onSuccess={(newUrl) => {
            setProfile((prev) =>
              prev ? { ...prev, avatar_url: newUrl } : null
            );
          }}
        />
      )}
    </div>
  );
}
