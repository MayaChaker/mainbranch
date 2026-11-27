// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JoinLeaveButton } from "./JoinLeaveButton";

const auth = vi.hoisted(() => ({ status: "authenticated" }));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ status: auth.status }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const fetchMock = vi.fn();

function reply(status: number, body?: unknown) {
  return Promise.resolve(
    new Response(body === undefined ? null : JSON.stringify(body), { status }),
  );
}

function renderButton(memberCount = 3) {
  render(
    <JoinLeaveButton
      communityId="665f00000000000000000099"
      communityName="Python"
      slug="python"
      memberCount={memberCount}
    />,
  );
}

beforeEach(() => {
  auth.status = "authenticated";
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("JoinLeaveButton", () => {
  it("asks a signed-out visitor to sign in and come back", () => {
    auth.status = "unauthenticated";
    renderButton();

    const link = screen.getByRole("link", { name: "Sign in to join" });
    expect(link.getAttribute("href")).toBe(
      "/signin?callbackUrl=%2Fcommunities%2Fpython",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("joins and adds one to the member count", async () => {
    fetchMock
      .mockReturnValueOnce(reply(200, { isMember: false }))
      .mockReturnValueOnce(reply(201, { isMember: true }));
    renderButton(3);

    await userEvent.click(await screen.findByRole("button", { name: "Join Python" }));

    expect(await screen.findByText("You are a member.")).toBeTruthy();
    expect(screen.getByText("4 members")).toBeTruthy();
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/communities/665f00000000000000000099/membership",
      { method: "POST" },
    );
  });

  it("keeps the count when the server says the user was already a member", async () => {
    fetchMock
      .mockReturnValueOnce(reply(200, { isMember: false }))
      .mockReturnValueOnce(reply(200, { isMember: true }));
    renderButton(3);

    await userEvent.click(await screen.findByRole("button", { name: "Join Python" }));

    expect(await screen.findByText("You are a member.")).toBeTruthy();
    expect(screen.getByText("3 members")).toBeTruthy();
  });

  it("leaves and removes one from the member count", async () => {
    fetchMock
      .mockReturnValueOnce(reply(200, { isMember: true }))
      .mockReturnValueOnce(reply(204));
    renderButton(1);

    await userEvent.click(await screen.findByRole("button", { name: "Leave Python" }));

    expect(await screen.findByRole("button", { name: "Join Python" })).toBeTruthy();
    expect(screen.getByText("0 members")).toBeTruthy();
  });

  it("shows an error and changes nothing when joining fails", async () => {
    fetchMock
      .mockReturnValueOnce(reply(200, { isMember: false }))
      .mockReturnValueOnce(reply(500, { error: "Server error" }));
    renderButton(3);

    await userEvent.click(await screen.findByRole("button", { name: "Join Python" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Could not join. Please try again.",
    );
    expect(screen.getByRole("button", { name: "Join Python" })).toBeTruthy();
    expect(screen.getByText("3 members")).toBeTruthy();
    expect(screen.queryByText("You are a member.")).toBeNull();
  });
});
