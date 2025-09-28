export interface DevUser {
  email: string;
  name: string;
  role?: string;
  orgRole?: string;
}

export const getDevUsers = () => {
  const fromEmailDomain =
    process.env.NEXT_PUBLIC_TEST_USER_EMAIL_DOMAIN || "example.com";

  return {
    superAdmin: {
      email: `superadmin@${fromEmailDomain}`,
      name: "System Super Admin",
      role: "super-admin",
    } as DevUser,

    techCorp: [
      {
        email: `org1owner1@${fromEmailDomain}`,
        name: "TechCorp Owner",
        orgRole: "owner",
      },
      {
        email: `org1admin1@${fromEmailDomain}`,
        name: "TechCorp Admin One",
        orgRole: "admin",
      },
      {
        email: `org1admin2@${fromEmailDomain}`,
        name: "TechCorp Admin Two",
        orgRole: "admin",
      },
      {
        email: `org1member1@${fromEmailDomain}`,
        name: "TechCorp Member One",
        orgRole: "member",
      },
      {
        email: `org1member2@${fromEmailDomain}`,
        name: "TechCorp Member Two",
        orgRole: "member",
      },
    ] as DevUser[],

    eduSoft: [
      {
        email: `org2owner1@${fromEmailDomain}`,
        name: "EduSoft Owner",
        orgRole: "owner",
      },
      {
        email: `org2admin1@${fromEmailDomain}`,
        name: "EduSoft Admin",
        orgRole: "admin",
      },
      {
        email: `org2member1@${fromEmailDomain}`,
        name: "EduSoft Member One",
        orgRole: "member",
      },
      {
        email: `org2member2@${fromEmailDomain}`,
        name: "EduSoft Member Two",
        orgRole: "member",
      },
    ] as DevUser[],

    devSkills: [
      {
        email: `org3owner1@${fromEmailDomain}`,
        name: "DevSkills Owner",
        orgRole: "owner",
      },
      {
        email: `org3admin1@${fromEmailDomain}`,
        name: "DevSkills Admin",
        orgRole: "admin",
      },
      {
        email: `org3member1@${fromEmailDomain}`,
        name: "DevSkills Member",
        orgRole: "member",
      },
    ] as DevUser[],
  };
};

export const getAllDevUsers = (): DevUser[] => {
  const users = getDevUsers();
  return [
    users.superAdmin,
    ...users.techCorp,
    ...users.eduSoft,
    ...users.devSkills,
  ];
};
