import { createContext, useContext, useEffect, useState } from "react";
import { useMember, useSetWorld } from "../queries/members";
import { log } from "../lib/log";

export type World = "underground" | "lab" | "prestige";
const KEY_ID = "kinship.memberId";
const KEY_WORLD = "kinship.world";

type Ctx = {
  memberId: number | null;
  setMemberId: (id: number | null) => void;
  world: World;
  setWorld: (w: World) => void;
  member: ReturnType<typeof useMember>["data"];
  loading: boolean;
};
const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [memberId, setId] = useState<number | null>(() => {
    const v = Number(localStorage.getItem(KEY_ID));
    return v > 0 ? v : null;
  });
  const [world, setW] = useState<World>(() => (localStorage.getItem(KEY_WORLD) as World) || "underground");
  const member = useMember(memberId);
  const saveWorld = useSetWorld();

  useEffect(() => {
    document.documentElement.dataset.world = world;
    localStorage.setItem(KEY_WORLD, world);
  }, [world]);

  useEffect(() => {
    if (member.isError) setMemberId(null);
  }, [member.isError]);

  function setMemberId(id: number | null) {
    log.decide("session", "Demo passport switched", { memberId: id });
    if (id) localStorage.setItem(KEY_ID, String(id));
    else localStorage.removeItem(KEY_ID);
    setId(id);
  }
  function setWorld(w: World) {
    log.decide("theme", "Visual world selected", { world: w });
    setW(w);
    if (memberId) saveWorld.mutate({ memberId, world: w });
  }

  return (
    <SessionCtx.Provider
      value={{ memberId, setMemberId, world, setWorld, member: member.data, loading: member.isLoading }}
    >
      {children}
    </SessionCtx.Provider>
  );
}

export function useSession() {
  const c = useContext(SessionCtx);
  if (!c) throw new Error("SessionProvider missing");
  return c;
}
