import { getOrgScopedData, getUserMemberOrganizations, getUserAdminOrganizations } from "@/lib/data-access";
jest.mock("@/lib/auth", () => ({
  auth: {
    api: {
      organization: {
        hasPermission: jest.fn(),
        listOrganizations: jest.fn(),
      },
    },
  },
}));

describe("Permission System Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrgScopedData", () => {
    it("should return data when user has permission", async () => {
      const { auth } = require("@/lib/auth");
      const mockData = { id: "quiz1", title: "Test Quiz" };
      const mockQueryFn = jest.fn().mockResolvedValue(mockData);

      auth.api.organization.hasPermission.mockResolvedValue(true);

      const result = await getOrgScopedData(
        "user1",
        "org1",
        "quiz",
        "read",
        mockQueryFn
      );

      expect(result).toEqual(mockData);
      expect(auth.api.organization.hasPermission).toHaveBeenCalledWith({
        userId: "user1",
        organizationId: "org1",
        resource: "quiz",
        action: "read",
      });
      expect(mockQueryFn).toHaveBeenCalledWith("org1");
    });

    it("should throw error when user lacks permission", async () => {
      const { auth } = require("@/lib/auth");
      const mockQueryFn = jest.fn();

      auth.api.organization.hasPermission.mockResolvedValue(false);

      await expect(getOrgScopedData(
        "user1",
        "org1",
        "quiz",
        "read",
        mockQueryFn
      )).rejects.toThrow("Insufficient permissions");

      expect(mockQueryFn).not.toHaveBeenCalled();
    });

    it("should handle permission check errors", async () => {
      const { auth } = require("@/lib/auth");
      const mockError = new Error("Permission check failed");
      const mockQueryFn = jest.fn();

      auth.api.organization.hasPermission.mockRejectedValue(mockError);

      await expect(getOrgScopedData(
        "user1",
        "org1",
        "quiz",
        "read",
        mockQueryFn
      )).rejects.toThrow("Permission check failed");

      expect(mockQueryFn).not.toHaveBeenCalled();
    });
  });

  describe("getUserMemberOrganizations", () => {
    it("should return user member organizations", async () => {
      const { auth } = require("@/lib/auth");
      const mockOrganizations = [
        { id: "org1", name: "Org 1", role: "member" },
        { id: "org2", name: "Org 2", role: "admin" },
        { id: "org3", name: "Org 3", role: "owner" },
      ];

      auth.api.organization.listOrganizations.mockResolvedValue(mockOrganizations);

      const result = await getUserMemberOrganizations("user1");

      expect(result).toEqual(mockOrganizations);
      expect(auth.api.organization.listOrganizations).toHaveBeenCalledWith({
        userId: "user1",
        role: ["owner", "admin", "member"]
      });
    });

    it("should handle errors in fetching member organizations", async () => {
      const { auth } = require("@/lib/auth");
      const mockError = new Error("Failed to fetch organizations");

      auth.api.organization.listOrganizations.mockRejectedValue(mockError);

      await expect(getUserMemberOrganizations("user1")).rejects.toThrow("Failed to fetch organizations");
    });
  });

  describe("getUserAdminOrganizations", () => {
    it("should return user admin organizations", async () => {
      const { auth } = require("@/lib/auth");
      const mockOrganizations = [
        { id: "org1", name: "Org 1", role: "admin" },
        { id: "org2", name: "Org 2", role: "owner" },
      ];

      auth.api.organization.listOrganizations.mockResolvedValue(mockOrganizations);

      const result = await getUserAdminOrganizations("user1");

      expect(result).toEqual(mockOrganizations);
      expect(auth.api.organization.listOrganizations).toHaveBeenCalledWith({
        userId: "user1",
        role: ["owner", "admin"]
      });
    });

    it("should handle errors in fetching admin organizations", async () => {
      const { auth } = require("@/lib/auth");
      const mockError = new Error("Failed to fetch admin organizations");

      auth.api.organization.listOrganizations.mockRejectedValue(mockError);

      await expect(getUserAdminOrganizations("user1")).rejects.toThrow("Failed to fetch admin organizations");
    });
  });

  describe("Permission Boundary Testing", () => {
    const testCases = [
      { resource: "quiz", actions: ["create", "read", "update", "delete"] },
      { resource: "question", actions: ["create", "read", "update", "delete"] },
      { resource: "response", actions: ["read", "delete", "export"] },
      { resource: "user", actions: ["invite", "remove", "update-role", "view"] },
    ];

    testCases.forEach(({ resource, actions }) => {
      describe(`${resource} permissions`, () => {
        actions.forEach((action) => {
          it(`should handle ${action} permission for ${resource}`, async () => {
            const { auth } = require("@/lib/auth");
            const mockQueryFn = jest.fn().mockResolvedValue({ success: true });

            auth.api.organization.hasPermission.mockResolvedValue(true);

            const result = await getOrgScopedData(
              "user1",
              "org1",
              resource,
              action,
              mockQueryFn
            );

            expect(result).toEqual({ success: true });
            expect(auth.api.organization.hasPermission).toHaveBeenCalledWith({
              userId: "user1",
              organizationId: "org1",
              resource: resource,
              action: action,
            });
          });

          it(`should deny ${action} permission for ${resource} when unauthorized`, async () => {
            const { auth } = require("@/lib/auth");
            const mockQueryFn = jest.fn();

            auth.api.organization.hasPermission.mockResolvedValue(false);

            await expect(getOrgScopedData(
              "user1",
              "org1",
              resource,
              action,
              mockQueryFn
            )).rejects.toThrow("Insufficient permissions");

            expect(mockQueryFn).not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});