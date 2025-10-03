export interface DevUser {
  email: string;
  name: string;
  role?: string;
  orgRole?: string;
  avatar?: string;
}

export const getDevUsers = () => {
  const fromEmailDomain =
    process.env.NEXT_PUBLIC_TEST_USER_EMAIL_DOMAIN || "example.com";

  return {
    superAdmin: {
      email: `superadmin@${fromEmailDomain}`,
      name: "System Super Admin",
      role: "super-admin",
      avatar: "👨‍💼",
    } as DevUser,

    techCorp: [
      {
        email: `org1owner1@${fromEmailDomain}`,
        name: "Principal Sarah Johnson",
        orgRole: "owner",
        avatar: "👩‍💼",
      },
      {
        email: `org1admin1@${fromEmailDomain}`,
        name: "Admin Director Mike Chen",
        orgRole: "admin",
        avatar: "👨‍💼",
      },
      {
        email: `org1admin2@${fromEmailDomain}`,
        name: "Admin Coordinator Lisa Brown",
        orgRole: "admin",
        avatar: "👩‍💼",
      },
      {
        email: `org1member1@${fromEmailDomain}`,
        name: "Teacher John Martinez",
        orgRole: "member",
        avatar: "👨‍🏫",
      },
      {
        email: `org1member2@${fromEmailDomain}`,
        name: "Teacher Emma Wilson",
        orgRole: "member",
        avatar: "👩‍🏫",
      },
    ] as DevUser[],

    eduSoft: [
      {
        email: `org2owner1@${fromEmailDomain}`,
        name: "Principal David Park",
        orgRole: "owner",
        avatar: "👨‍💼",
      },
      {
        email: `org2admin1@${fromEmailDomain}`,
        name: "Admin Director Rachel Kim",
        orgRole: "admin",
        avatar: "👩‍💼",
      },
      {
        email: `org2member1@${fromEmailDomain}`,
        name: "Teacher Carlos Rodriguez",
        orgRole: "member",
        avatar: "👨‍🏫",
      },
      {
        email: `org2member2@${fromEmailDomain}`,
        name: "Teacher Amanda Lee",
        orgRole: "member",
        avatar: "👩‍🏫",
      },
    ] as DevUser[],

    devSkills: [
      {
        email: `org3owner1@${fromEmailDomain}`,
        name: "Principal Jennifer Taylor",
        orgRole: "owner",
        avatar: "👩‍💼",
      },
      {
        email: `org3admin1@${fromEmailDomain}`,
        name: "Admin Director Robert Smith",
        orgRole: "admin",
        avatar: "👨‍💼",
      },
      {
        email: `org3member1@${fromEmailDomain}`,
        name: "Teacher Maria Garcia",
        orgRole: "member",
        avatar: "👩‍🏫",
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
