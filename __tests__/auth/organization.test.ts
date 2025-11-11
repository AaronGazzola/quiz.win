import {
  createOrganizationAction,
  getOrganizationsAction,
} from "@/app/(dashboard)/invite/page.actions";
jest.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
      listOrganizations: jest.fn(),
      createOrganization: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  headers: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/lib/role.utils", () => ({
  isSuperAdmin: jest.fn(),
  getUserAdminOrganizations: jest.fn(),
}));

describe("Organization API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrganizationsAction", () => {
    it("should return error when user is not authenticated", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.getSession.mockResolvedValue(null);

      const result = await getOrganizationsAction();

      expect(result.error).toBe("Not authenticated");
      expect(result.data).toBeNull();
    });

    it("should return all organizations for super admin", async () => {
      const { auth } = require("@/lib/auth");
      const { isSuperAdmin } = require("@/lib/role.utils");

      const mockSession = { user: { id: "user1" } };
      const mockOrganizations = [
        { id: "org1", name: "Organization 1", slug: "org1" },
        { id: "org2", name: "Organization 2", slug: "org2" },
      ];

      auth.api.getSession.mockResolvedValue(mockSession);
      isSuperAdmin.mockResolvedValue(true);
      auth.api.listOrganizations.mockResolvedValue(mockOrganizations);

      const result = await getOrganizationsAction();

      expect(result.data).toEqual(mockOrganizations);
      expect(result.error).toBeNull();
    });

    it("should return admin organizations for regular admin", async () => {
      const { auth } = require("@/lib/auth");
      const {
        isSuperAdmin,
        getUserAdminOrganizations,
      } = require("@/lib/role.utils");

      const mockSession = { user: { id: "user1" } };
      const mockAdminOrganizations = [
        { id: "org1", name: "Organization 1", slug: "org1" },
      ];

      auth.api.getSession.mockResolvedValue(mockSession);
      isSuperAdmin.mockResolvedValue(false);
      getUserAdminOrganizations.mockResolvedValue(mockAdminOrganizations);

      const result = await getOrganizationsAction();

      expect(result.data).toEqual(mockAdminOrganizations);
      expect(result.error).toBeNull();
    });
  });

  describe("createOrganizationAction", () => {
    it("should return error when user is not authenticated", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.getSession.mockResolvedValue(null);

      const result = await createOrganizationAction("Test Org");

      expect(result.error).toBe("Not authenticated");
      expect(result.data).toBeNull();
    });

    it("should return error when user is not super admin", async () => {
      const { auth } = require("@/lib/auth");
      const { isSuperAdmin } = require("@/lib/role.utils");

      const mockSession = { user: { id: "user1" } };

      auth.api.getSession.mockResolvedValue(mockSession);
      isSuperAdmin.mockResolvedValue(false);

      const result = await createOrganizationAction("Test Org");

      expect(result.error).toBe("Only super admins can create organizations");
      expect(result.data).toBeNull();
    });

    it("should create organization successfully for super admin", async () => {
      const { auth } = require("@/lib/auth");
      const { isSuperAdmin } = require("@/lib/role.utils");

      const mockSession = { user: { id: "user1" } };
      const mockOrganization = {
        id: "org1",
        name: "Test Org",
        slug: "test-org",
        createdAt: new Date(),
        logo: null,
        metadata: {},
        members: [],
      };

      auth.api.getSession.mockResolvedValue(mockSession);
      isSuperAdmin.mockResolvedValue(true);
      auth.api.createOrganization.mockResolvedValue(mockOrganization);

      const result = await createOrganizationAction("Test Org");

      expect(result.data).toEqual({
        id: "org1",
        name: "Test Org",
        slug: "test-org",
      });
      expect(result.error).toBeNull();
      expect(auth.api.createOrganization).toHaveBeenCalledWith({
        body: {
          name: "Test Org",
          slug: "test-org",
        },
        headers: {},
      });
    });

    it("should handle organization creation errors", async () => {
      const { auth } = require("@/lib/auth");
      const { isSuperAdmin } = require("@/lib/role.utils");

      const mockSession = { user: { id: "user1" } };
      const mockError = new Error("Organization already exists");

      auth.api.getSession.mockResolvedValue(mockSession);
      isSuperAdmin.mockResolvedValue(true);
      auth.api.createOrganization.mockRejectedValue(mockError);

      const result = await createOrganizationAction("Existing Org");

      expect(result.error).toEqual(mockError);
      expect(result.data).toBeNull();
    });
  });
});
